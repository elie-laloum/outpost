import { readFile, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";

const names = ["harness", "codex", "claude", "antigravity", "copilot", "kimi"];
const entries = process.argv.slice(2).map((argument) => {
  const match = /^([a-z]+)=(sha256:[a-f0-9]{64})$/.exec(argument);
  assert.ok(
    match && names.includes(match[1]),
    `Pass NAME=sha256:DIGEST pairs from the Images workflow summary (${names.join(", ")})`,
  );
  return [match[1], match[2]];
});
assert.deepEqual(
  entries.map(([name]) => name).sort(),
  [...names].sort(),
  "Record every official image digest from the same verified workflow run",
);
const path = new URL("../src/cli/images.constants.ts", import.meta.url);
const source = await readFile(path, "utf8");
const record = entries
  .sort(([left], [right]) => names.indexOf(left) - names.indexOf(right))
  .map(([name, digest]) => `    ${name}: ${JSON.stringify(digest)},`)
  .join("\n");
const updated = source.replace(
  /export const publishedImages: Readonly<Record<string, string>> = Object\.freeze\(\s*\{[^}]*\},?\s*\);/,
  `export const publishedImages: Readonly<Record<string, string>> = Object.freeze(\n  {\n${record}\n  },\n);`,
);
assert.notEqual(
  source,
  updated,
  "publishedImages declaration was not found or unchanged",
);
await writeFile(path, updated);
console.log(
  "Recorded the verified image digests. Review and commit the update before publishing the package.",
);
