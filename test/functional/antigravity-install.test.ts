import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { executeProcess } from "../../src/infrastructure/process.ts";
import { antigravityInstall } from "../../src/adapters/agents/antigravity/antigravity-install.ts";
import { antigravityReleases } from "../../src/adapters/agents/antigravity/antigravity-install.constants.ts";
import { agentVersions } from "../../src/providers/versions.constants.ts";

const unix = process.platform !== "win32";

test("Antigravity pins every release URL and digest to the public reference version", () => {
  for (const release of Object.values(antigravityReleases)) {
    assert.ok(
      release.url.startsWith(
        `https://storage.googleapis.com/antigravity-public/antigravity-cli/${agentVersions.antigravity}-`,
      ),
    );
    assert.match(release.sha512, /^[a-f0-9]{128}$/);
  }
});

test(
  "verified Antigravity installation selects platforms and rejects corrupt or interrupted downloads without replacing binaries",
  { skip: !unix },
  async (t) => {
    const directory = await mkdtemp(join(tmpdir(), "outpost-agy-"));
    t.after(() => rm(directory, { recursive: true, force: true }));
    const bin = join(directory, "bin");
    const source = join(directory, "source");
    const destination = join(directory, "agent's tools");
    await Promise.all([bin, source, destination].map((path) => mkdir(path)));
    const contents = '#!/bin/sh\nprintf "fixture agy\\n"\n';
    await writeFile(join(source, "antigravity"), contents);
    const archive = join(directory, "release.tar.gz");
    const packed = await executeProcess({
      executable: "tar",
      arguments: ["-czf", archive, "-C", source, "antigravity"],
    });
    assert.equal(packed.status, 0, packed.stderr);
    const sha512 = createHash("sha512")
      .update(await readFile(archive))
      .digest("hex");
    const releases = Object.fromEntries(
      Object.keys(antigravityReleases).map((platform) => [
        platform,
        { url: `https://example.invalid/${platform}.tar.gz`, sha512 },
      ]),
    );
    await writeFile(
      join(bin, "uname"),
      '#!/bin/sh\ncase "$1" in -s) echo "$FIXTURE_OS" ;; -m) echo "$FIXTURE_ARCH" ;; esac\n',
      { mode: 0o755 },
    );
    await writeFile(join(bin, "ldd"), '#!/bin/sh\necho "$FIXTURE_LIBC"\n', {
      mode: 0o755,
    });
    await writeFile(
      join(bin, "curl"),
      `#!/bin/sh
while [ "$#" -gt 0 ]; do
  case "$1" in https:*) printf '%s' "$1" > "$FIXTURE_REQUEST" ;; -o) shift; output="$1" ;; esac
  shift
done
case "$FIXTURE_MODE" in
  failure) printf partial > "$output"; exit 22 ;;
  interrupt) printf partial > "$output"; kill -TERM "$PPID"; exit 1 ;;
  corrupt) printf corrupted > "$output"; exit 0 ;;
esac
cp "$FIXTURE_ARCHIVE" "$output"
`,
      { mode: 0o755 },
    );
    if (process.platform === "darwin")
      await writeFile(
        join(bin, "sha512sum"),
        '#!/bin/sh\nexec shasum -a 512 "$@"\n',
        { mode: 0o755 },
      );
    const target = join(destination, "agy");
    const variables = {
      PATH: `${bin}:${process.env.PATH}`,
      FIXTURE_OS: "Linux",
      FIXTURE_ARCH: "x86_64",
      FIXTURE_LIBC: "glibc",
      FIXTURE_MODE: "success",
      FIXTURE_REQUEST: join(directory, "request"),
      FIXTURE_ARCHIVE: archive,
    };
    const command = {
      executable: "sh",
      arguments: ["-c", antigravityInstall(target, releases)],
      variables,
    };
    for (const [os, arch, libc, platform] of [
      ["Linux", "x86_64", "glibc", "linux_amd64"],
      ["Linux", "aarch64", "glibc", "linux_arm64"],
      ["Linux", "amd64", "musl", "linux_amd64_musl"],
      ["Linux", "arm64", "musl", "linux_arm64_musl"],
      ["Darwin", "x86_64", "", "darwin_amd64"],
      ["Darwin", "arm64", "", "darwin_arm64"],
    ] as const) {
      const result = await executeProcess({
        ...command,
        variables: {
          ...variables,
          FIXTURE_OS: os,
          FIXTURE_ARCH: arch,
          FIXTURE_LIBC: libc,
        },
      });
      assert.equal(result.status, 0, result.stderr);
      assert.equal(
        await readFile(variables.FIXTURE_REQUEST, "utf8"),
        releases[platform]!.url,
      );
      assert.equal(await readFile(target, "utf8"), contents);
      assert.equal((await stat(target)).mode & 0o777, 0o755);
      assert.deepEqual(await readdir(destination), ["agy"]);
    }
    await writeFile(target, "preserve existing binary");
    for (const mode of ["corrupt", "failure", "interrupt"]) {
      const result = await executeProcess({
        ...command,
        variables: { ...variables, FIXTURE_MODE: mode },
      });
      assert.notEqual(result.status, 0);
      if (mode === "corrupt")
        assert.match(result.stderr, /SHA-512 checksum mismatch/);
      assert.equal(await readFile(target, "utf8"), "preserve existing binary");
      assert.deepEqual(await readdir(destination), ["agy"]);
    }
    for (const override of [
      { FIXTURE_OS: "Windows" },
      { FIXTURE_ARCH: "riscv64" },
    ]) {
      const result = await executeProcess({
        ...command,
        variables: { ...variables, ...override },
      });
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /Unsupported Antigravity/);
      assert.deepEqual(await readdir(destination), ["agy"]);
    }
    await writeFile(archive, "not an archive");
    const invalidDigest = createHash("sha512")
      .update(await readFile(archive))
      .digest("hex");
    const result = await executeProcess({
      ...command,
      arguments: [
        "-c",
        antigravityInstall(target, {
          linux_amd64: {
            url: "https://example.invalid/bad.tar.gz",
            sha512: invalidDigest,
          },
        }),
      ],
    });
    assert.notEqual(result.status, 0);
    assert.equal(await readFile(target, "utf8"), "preserve existing binary");
    assert.deepEqual(await readdir(destination), ["agy"]);
  },
);
