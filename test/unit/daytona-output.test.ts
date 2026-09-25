import assert from "node:assert/strict";
import { test } from "node:test";
import { daytonaOutput } from "../../src/providers/daytona-output.ts";
import { daytonaOutputPrefix } from "../../src/providers/daytona-command.constants.ts";

test("Daytona output decodes fragmented frames and split Unicode without adding line endings", () => {
  const bytes = Buffer.from("file\0é🐱\n\n");
  const frames = [...bytes]
    .map(
      (byte) =>
        daytonaOutputPrefix + Buffer.from([byte]).toString("base64") + "\n",
    )
    .join("");
  let result = "";
  const output = daytonaOutput((text) => {
    result += text;
  });
  for (const character of frames) output.write(character);
  output.close();
  assert.equal(result, bytes.toString("utf8"));
});

test("Daytona output retains launch errors outside encoded command output", () => {
  let result = "";
  const output = daytonaOutput((text) => {
    result += text;
  });
  output.write("node: not found\n");
  output.write("out");
  output.close();
  assert.equal(result, "node: not found\nout");
});
