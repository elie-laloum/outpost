import { repository } from "../helpers.ts";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const script = fileURLToPath(
  new URL("../../scripts/verify-release.mjs", import.meta.url),
);
const english =
  "# Changelog\n\n## Unreleased\n\n## 1.2.3\n\n### Fixed\n\n- Shipped.\n\n## 1.2.2\n\n- Older.\n";
const french = english
  .replace("Shipped.", "Publié.")
  .replace("Older.", "Ancien.");

async function verify(en = english, fr = french, tag = "v1.2.3") {
  const root = await mkdtemp(join(tmpdir(), "outpost-release-test-"));
  try {
    await mkdir(join(root, "docs", "translations"), { recursive: true });
    await writeFile(
      join(root, "package.json"),
      JSON.stringify({ name: "@elie-laloum/outpost", version: "1.2.3" }),
    );
    await writeFile(join(root, "CHANGELOG.md"), en);
    await writeFile(join(root, "docs", "translations", "changelog.fr.md"), fr);
    return execFileSync(process.execPath, [script], {
      cwd: root,
      env: { ...process.env, GITHUB_ACTIONS: "false", GITHUB_REF_NAME: tag },
      encoding: "utf8",
      stdio: "pipe",
      timeout: 10000,
    });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

test("release verification emits only the selected version's notes", async () => {
  assert.equal(await verify(), "### Fixed\n\n- Shipped.\n");
});

test("releases require matching, nonempty English and French version sections", async () => {
  await assert.rejects(
    verify(english.replace("## 1.2.3", "## 1.2.4")),
    /1\.2\.3/,
  );
  await assert.rejects(
    verify(english, french.replace("## 1.2.3", "## 1.2.4")),
    /1\.2\.3/,
  );
  await assert.rejects(
    verify(english.replace("### Fixed\n\n- Shipped.", "")),
    /empty/i,
  );
  await assert.rejects(
    verify(english, french.replace("### Fixed\n\n- Publié.", "")),
    /empty/i,
  );
  await assert.rejects(
    verify(english + "\n## 1.2.3\n\nDuplicate\n"),
    /duplicate/i,
  );
  await assert.rejects(verify(english, french, "v1.2.4"), /tag/i);
});

test("releases refuse pending unreleased changes in either language", async () => {
  await assert.rejects(
    verify(english.replace("## Unreleased", "## Unreleased\n\n- Pending.")),
    /Unreleased/,
  );
  await assert.rejects(
    verify(
      english,
      french.replace("## Unreleased", "## Unreleased\n\n- En attente."),
    ),
    /Unreleased/,
  );
});

test("release CI refuses a tagged commit outside origin/main", async (t) => {
  const root = await repository(t);
  const git = (...args: string[]) =>
    execFileSync("git", args, {
      cwd: root,
      encoding: "utf8",
      stdio: "pipe",
    }).trim();
  const main = git("rev-parse", "HEAD");
  git("update-ref", "refs/remotes/origin/main", main);
  git("checkout", "--orphan", "unrelated");
  git("commit", "--allow-empty", "-m", "unrelated");
  assert.throws(
    () =>
      execFileSync(process.execPath, [script], {
        cwd: root,
        env: {
          ...process.env,
          GITHUB_ACTIONS: "true",
          GITHUB_SHA: git("rev-parse", "HEAD"),
          GITHUB_REF_NAME: "v1.2.3",
        },
        stdio: "pipe",
      }),
    /Command failed/,
  );
});
