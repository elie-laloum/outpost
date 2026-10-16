import assert from "node:assert/strict";
import { createAgent, dispatch } from "@elie-laloum/outpost";
import { createDockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";
import { createLocalSandboxProvider } from "@elie-laloum/outpost/providers/local";
import { demoRepository } from "../shared/repository.ts";
import { createOfflineAgent } from "./outpost.ts";
import { nativeHarnesses } from "./native.ts";

const mode = process.argv[2] ?? "outpost";
if (mode !== "outpost" && !Object.hasOwn(nativeHarnesses, mode))
  throw new Error(
    "Usage: node examples/74-lifecycle-hooks/index.ts [outpost|claude|codex|copilot|kimi|antigravity]",
  );

const native = Object.entries(nativeHarnesses).find(([name]) => name === mode);
const agent = native
  ? createAgent({ harness: native[1]() })
  : createOfflineAgent();
const result = await dispatch({
  repository: demoRepository(import.meta.dirname),
  agent,
  sandboxProvider: native
    ? createDockerSandboxProvider({
        image: process.env.OUTPOST_CONTAINER_IMAGE ?? "outpost:sandbox",
      })
    : createLocalSandboxProvider(),
  brief: {
    text: "Read README.md with a file-reading tool, then summarize it. Do not edit files, commit or publish. End with <outpost>done</outpost>.",
  },
  logging: false,
  observe(event) {
    if (event.kind === "hook")
      console.log(`[Outpost] ${event.phase}: changed=${event.changed}`);
  },
});

console.log("Answer:", result.text);
console.log("Usage:", result.usage);
assert.equal(result.completed, true);
if (mode === "outpost") {
  assert.match(result.text, /Reviewed/);
  assert.equal(result.usage.input, 20);
  assert.equal(result.usage.output, 10);
  console.log("Offline lifecycle verified; original usage preserved.");
}
