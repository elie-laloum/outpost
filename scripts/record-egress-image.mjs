import { readFile, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";

const image = process.argv[2];
assert.match(
  image ?? "",
  /^ghcr\.io\/elie-laloum\/outpost\/egress@sha256:[a-f0-9]{64}$/,
  "Pass the published, verified egress image reference from the image workflow",
);
const path = new URL(
  "../src/providers/container-egress.constants.ts",
  import.meta.url,
);
const source = await readFile(path, "utf8");
const updated = source.replace(
  /export const defaultEgressImage: string \| undefined =\s*(?:undefined|"[^"]*");/,
  `export const defaultEgressImage: string | undefined =\n  ${JSON.stringify(image)};`,
);
assert.notEqual(
  source,
  updated,
  "Default image was unchanged or its declaration was not found",
);
await writeFile(path, updated);
console.log(
  "Recorded the image digest. Review and commit the update before publishing the package.",
);
