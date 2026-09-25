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
import { compatibilityLimits } from "./cloud-compatibility.constants.ts";
import type { CompatibilityOptions } from "./cloud-compatibility.types.ts";

export const verifyCloudLease: NonNullable<
  CompatibilityOptions["verify"]
> = async (lease, directory, signal, record) => {
  const invoke = (script: string, args: readonly string[] = []) =>
    lease.invoke({
      executable: "node",
      arguments: ["-e", script, ...args],
      signal,
      deadlineMs: compatibilityLimits.commandMs,
    });
  const result = await invoke(
    "const fs=require('node:fs'); console.log('before-close'); fs.closeSync(1); fs.closeSync(2); setTimeout(()=>process.exit(17),150)",
  );
  assert.equal(result.status, 17);
  assert.match(result.stdout, /before-close/);
  record({ name: "process-completion", status: "pass" });
  const exact = await invoke(
    'process.stdout.write("path\\0é🐱"); process.stderr.write("warning\\0")',
  );
  assert.equal(exact.status, 0);
  assert.equal(exact.stdout, "path\0é🐱");
  assert.equal(exact.stderr, "warning\0");
  record({ name: "exact-command-output", status: "pass" });
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
  assert.equal((await invoke("process.exit(0)")).status, 0);
  record({ name: "cancellation-and-reuse", status: "pass" });
  const source = join(directory, "source");
  await mkdir(join(source, "empty"), { recursive: true });
  const bytes = Buffer.from(
    Array.from(
      { length: compatibilityLimits.bytes },
      (_, index) => index % 256,
    ),
  );
  const filename = "binary ' spaced.bin";
  await writeFile(join(source, filename), bytes);
  await chmod(join(source, filename), 0o751);
  await symlink(filename, join(source, "relative-link"));
  const remote = posix.join(lease.root, "compatibility ' files");
  await lease.upload(source, remote, {
    signal,
    deadlineMs: compatibilityLimits.commandMs,
  });
  const verified = await invoke(
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
  assert.equal((await lstat(join(destination, filename))).mode & 0o777, 0o751);
  assert.equal(await readlink(join(destination, "relative-link")), filename);
  record({ name: "binary-paths-permissions-symlinks", status: "pass" });
  if (!lease.fileTransfers) {
    record({
      name: "batch-transfer",
      status: "skipped",
      reason: "capability-unavailable",
    });
    return;
  }
  const entries = await lease.fileTransfers.manifest(
    remote,
    [filename, "relative-link"],
    { signal },
  );
  const batch = join(directory, "batch");
  await lease.fileTransfers.downloadBatch(remote, entries, batch, { signal });
  assert.deepEqual(await readFile(join(batch, filename)), bytes);
  assert.equal(await readlink(join(batch, "relative-link")), filename);
  await assert.rejects(
    lease.fileTransfers.manifest(remote, ["../escape"], { signal }),
  );
  record({ name: "batch-transfer", status: "pass" });
};
