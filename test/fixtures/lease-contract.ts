import assert from "node:assert/strict";
import {
  chmod,
  lstat,
  mkdir,
  readFile,
  readlink,
  symlink,
  writeFile,
} from "node:fs/promises";
import { join, posix } from "node:path";
import type { SandboxLease } from "../../src/domain/sandbox.types.ts";
import { compatibilityLimits } from "./cloud-compatibility.constants.ts";
import type { LeaseContractCheck } from "./lease-contract.types.ts";

function node(
  lease: SandboxLease,
  signal: AbortSignal,
  script: string,
  args: readonly string[] = [],
) {
  return lease.invoke({
    executable: "node",
    arguments: ["-e", script, ...args],
    signal,
    deadlineMs: compatibilityLimits.commandMs,
  });
}

/** Ordered checks every sandbox lease satisfies; transfer checks share the first one's files. */
export const leaseContractChecks: readonly LeaseContractCheck[] = [
  {
    name: "process-completion",
    async run(lease, _directory, signal) {
      const result = await node(
        lease,
        signal,
        "const fs=require('node:fs'); console.log('before-close'); fs.closeSync(1); fs.closeSync(2); setTimeout(()=>process.exit(17),150)",
      );
      assert.equal(result.status, 17);
      assert.match(result.stdout, /before-close/);
      return "pass";
    },
  },
  {
    name: "exact-command-output",
    async run(lease, _directory, signal) {
      const exact = await node(
        lease,
        signal,
        'process.stdout.write("path\\0é🐱"); process.stderr.write("warning\\0")',
      );
      assert.equal(exact.status, 0);
      assert.equal(exact.stdout, "path\0é🐱");
      assert.equal(exact.stderr, "warning\0");
      return "pass";
    },
  },
  {
    name: "cancellation-and-reuse",
    async run(lease, _directory, signal) {
      await assert.rejects(
        lease.invoke({
          executable: "node",
          arguments: ["-e", "setInterval(()=>{},1000)"],
          signal,
          deadlineMs: compatibilityLimits.cancelMs,
        }),
      );
      const controller = new AbortController();
      const pending = lease.invoke({
        executable: "node",
        arguments: ["-e", "console.log('ready'); setInterval(()=>{},1000)"],
        signal: AbortSignal.any([signal, controller.signal]),
        deadlineMs: compatibilityLimits.commandMs,
        observe: () => controller.abort(),
      });
      await assert.rejects(pending);
      assert.equal(controller.signal.aborted, true);
      assert.equal((await node(lease, signal, "process.exit(0)")).status, 0);
      return "pass";
    },
  },
  {
    name: "binary-paths-permissions-symlinks",
    async run(lease, directory, signal) {
      const { bytes, filename, remote } = await uploadFixture(
        lease,
        directory,
        signal,
      );
      const verified = await node(
        lease,
        signal,
        "const fs=require('node:fs'), p=require('node:path'), a=require('node:assert/strict'); const root=process.argv[1], name=process.argv[2]; const data=fs.readFileSync(p.join(root,name)); a.equal(data.length,4096); for(let i=0;i<data.length;i++)a.equal(data[i],i%256); a.equal(fs.statSync(p.join(root,name)).mode&511,489); a.equal(fs.readlinkSync(p.join(root,'relative-link')),name); a.ok(fs.statSync(p.join(root,'empty')).isDirectory())",
        [remote, filename],
      );
      assert.equal(verified.status, 0);
      const destination = join(directory, "download");
      await lease.download(remote, destination, {
        signal,
        deadlineMs: compatibilityLimits.commandMs,
      });
      assert.deepEqual(await readFile(join(destination, filename)), bytes);
      assert.equal(
        (await lstat(join(destination, filename))).mode & 0o777,
        0o751,
      );
      assert.equal(
        await readlink(join(destination, "relative-link")),
        filename,
      );
      return "pass";
    },
  },
  {
    name: "batch-transfer",
    async run(lease, directory, signal) {
      if (!lease.fileTransfers) return "capability-unavailable";
      const { bytes, filename, remote } = fixture(lease, directory);
      const entries = await lease.fileTransfers.manifest(
        remote,
        [filename, "relative-link"],
        { signal },
      );
      const batch = join(directory, "batch");
      await lease.fileTransfers.downloadBatch(remote, entries, batch, {
        signal,
      });
      assert.deepEqual(await readFile(join(batch, filename)), bytes);
      assert.equal(await readlink(join(batch, "relative-link")), filename);
      await assert.rejects(
        lease.fileTransfers.manifest(remote, ["../escape"], { signal }),
      );
      return "pass";
    },
  },
];

function fixture(lease: SandboxLease, directory: string) {
  return {
    source: join(directory, "source"),
    filename: "binary ' spaced.bin",
    remote: posix.join(lease.root, "compatibility ' files"),
    bytes: Buffer.from(
      Array.from(
        { length: compatibilityLimits.bytes },
        (_, index) => index % 256,
      ),
    ),
  };
}

async function uploadFixture(
  lease: SandboxLease,
  directory: string,
  signal: AbortSignal,
) {
  const files = fixture(lease, directory);
  await mkdir(join(files.source, "empty"), { recursive: true });
  await writeFile(join(files.source, files.filename), files.bytes);
  await chmod(join(files.source, files.filename), 0o751);
  await symlink(files.filename, join(files.source, "relative-link"));
  await lease.upload(files.source, files.remote, {
    signal,
    deadlineMs: compatibilityLimits.commandMs,
  });
  return files;
}
