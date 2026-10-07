import assert from "node:assert/strict";
import { changed, createSandbox } from "@elie-laloum/outpost";
import { createLocalSandboxProvider } from "@elie-laloum/outpost/providers/local";
import { demoRepository } from "../shared/repository.ts";

// Run with Node.js 24+ after building Outpost; npm needs no registry access here.
await using sandbox = await createSandbox({
  repository: demoRepository(import.meta.dirname),
  sandboxProvider: createLocalSandboxProvider(),
  hooks: {
    sandboxReady: [
      {
        executable: "npm",
        arguments: ["ci", "--offline", "--no-audit", "--no-fund"],
        when: changed(["package-lock.json"]),
      },
    ],
  },
});
const installationCount = async () => {
  const result = await sandbox.command({
    executable: "node",
    arguments: [
      "-e",
      "console.log(require('fs').readFileSync('installations.log','utf8').trim().split('\\n').length)",
    ],
  });
  assert.equal(result.status, 0);
  return Number(result.stdout.trim());
};
const initial = await installationCount();
assert.equal(await installationCount(), initial);
const update = await sandbox.command({
  executable: "node",
  arguments: [
    "-e",
    "const fs=require('fs');const pkg=JSON.parse(fs.readFileSync('package.json'));const lock=JSON.parse(fs.readFileSync('package-lock.json'));pkg.version=lock.version=lock.packages[''].version=String(Number(pkg.version.split('.')[0])+1)+'.0.0';fs.writeFileSync('package.json',JSON.stringify(pkg,null,2)+'\\n');fs.writeFileSync('package-lock.json',JSON.stringify(lock,null,2)+'\\n');",
  ],
});
assert.equal(update.status, 0);
assert.equal(await installationCount(), initial + 1);
console.log(
  "Unchanged lockfile: installation skipped. Changed lockfile: npm ci ran again.",
);
