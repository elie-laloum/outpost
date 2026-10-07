// Repetition watchdog — detect repeated tool calls and stop, warn or steer the agent with an instruction.
// An offline model demonstrates all three policies using real local commands, without paid calls.

import assert from "node:assert/strict";
import {
  createAgent,
  createHarness,
  createHarnessShellTools,
  dispatch,
  OutpostError,
} from "@elie-laloum/outpost";
import type { AgentObservation, WatchdogOptions } from "@elie-laloum/outpost";
import { createLocalSandboxProvider } from "@elie-laloum/outpost/providers/local";
import { demoRepository } from "../shared/repository.ts";
import { createRepetitiveModel } from "./model.ts";

const repository = demoRepository(import.meta.dirname);
const policies: readonly WatchdogOptions["onStuck"][] = [
  "stop",
  "warn",
  {
    instruction: "Inspect README.md instead of repeating git status.",
    maxInterventions: 1,
  },
];
for (const onStuck of policies) {
  const events: AgentObservation[] = [];
  const operation = dispatch({
    repository,
    sandboxProvider: createLocalSandboxProvider(),
    agent: createAgent({
      model: "demo",
      harness: createHarness({
        modelProvider: createRepetitiveModel(),
        tools: [createHarnessShellTools()],
      }),
    }),
    brief: {
      text: "Inspect the repository. End with <outpost>done</outpost>.",
    },
    watchdog: { repetition: { window: 20, maxRepeats: 3 }, onStuck },
    logging: false,
    observe: (event) => events.push(event),
  });
  if (onStuck === "stop")
    await assert.rejects(
      operation,
      (error: unknown) =>
        error instanceof OutpostError && error.code === "stuck",
    );
  if (onStuck !== "stop") assert.equal((await operation).completed, true);
  const stuck = events.find((event) => event.kind === "stuck");
  assert.ok(stuck);
  console.log(
    `${stuck.action}: ${stuck.activity} repeated ${stuck.repeats} times`,
  );
}
