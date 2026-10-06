import type {
  ReplayDivergenceDetails,
  ReplayDivergenceKind,
} from "./replay.types.ts";

export const replayDecisionKinds = new Set([
  "decision",
  "decision-request",
  "decision-response",
]);

export const replayDefaults = Object.freeze({
  name: "replay",
  divergence: "fail",
  unrecorded: "The journal was recorded without logging.replayable",
  unfinished: "The recorded agent turn did not finish",
});

export const replayJournalFields: ReadonlySet<string> = new Set([
  "seq",
  "at",
  "source",
  "scope",
  "label",
  "pass",
]);

export const replayExecutionEvents: ReadonlySet<string> = new Set([
  "phase",
  "prompt",
  "summary",
  "fallback",
]);

export const replayFaultCodes: ReadonlySet<string> = new Set([
  "configuration",
  "process",
  "timeout",
  "aborted",
  "workspace",
  "conflict",
  "prompt",
  "response",
  "session",
  "provider",
  "limit",
  "quota",
  "replay",
  "steering",
]);

export const replayDivergenceMessages: Readonly<
  Record<ReplayDivergenceKind, (details: ReplayDivergenceDetails) => string>
> = Object.freeze({
  prompt: ({ turn }) =>
    `Replay turn ${turn} received a prompt that differs from the recording`,
  baseline: ({ turn }) =>
    `Replay turn ${turn} started from a workspace tree that differs from the recording`,
  tree: ({ turn, commit }) =>
    `Replay turn ${turn} could not reproduce the tree of recorded commit ${commit}`,
  exhausted: ({ turn }) => `The replay journal has no turn ${turn}`,
  unrecorded: ({ turn, expected }) =>
    `Replay turn ${turn} has no recorded workspace commits: ${expected}`,
});
