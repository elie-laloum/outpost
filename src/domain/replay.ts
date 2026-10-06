import { isAgentEvent } from "./agent-observation.ts";
import { visitAgentEvent } from "./agent-events.ts";
import type { AgentEvent, Usage } from "./agent.types.ts";
import { invariant, OutpostError } from "./errors.ts";
import { fallbackTriggers } from "./fallback-agent.constants.ts";
import type {
  FallbackCandidate,
  FallbackTrigger,
} from "./fallback-agent.types.ts";
import { addUsage, usageDifference } from "./usage.ts";
import { checkpointValue } from "./workflow/checkpoint-value.ts";
import type { FaultCode } from "./errors.types.ts";
import {
  replayDefaults,
  replayDecisionKinds,
  replayDivergenceMessages,
  replayExecutionEvents,
  replayFaultCodes,
  replayJournalFields,
} from "./replay.constants.ts";
import type {
  RecordedCommit,
  RecordedIdentity,
  RecordedRevision,
  ReplayAgent,
  ReplayAgentOptions,
  ReplayDivergenceDetails,
  ReplayDivergenceKind,
  ReplayFailure,
  DraftTurn,
  FallbackEvent,
  JournalObject,
  ReplayJournalEvent,
  ReplayRecording,
  ReplayTurn,
  ReplayDecisionEvent,
  WorkspaceCommitsEvent,
} from "./replay.types.ts";

export class ReplayDivergence extends OutpostError {
  readonly kind: ReplayDivergenceKind;
  readonly turn: number;
  readonly expected: string | undefined;
  readonly actual: string | undefined;
  readonly commit: string | undefined;

  constructor(details: ReplayDivergenceDetails) {
    super("replay", replayDivergenceMessages[details.kind](details), {
      ...details,
    });
    this.name = "ReplayDivergence";
    this.kind = details.kind;
    this.turn = details.turn;
    this.expected = details.expected;
    this.actual = details.actual;
    this.commit = details.commit;
  }
}

export function createReplayAgent(options: ReplayAgentOptions): ReplayAgent {
  invariant(
    options && typeof options === "object",
    "Replay options must be an object",
  );
  invariant(
    Array.isArray(options.journal),
    "Provide the journal entries returned by readJournal()",
  );
  const divergence = options.divergence ?? replayDefaults.divergence;
  invariant(
    divergence === "fail" || divergence === "warn",
    "Replay divergence must be fail or warn",
  );
  const { turns, source } = replayRecording(options.journal);
  let position = 0;
  return Object.freeze({
    kind: "replay",
    name: replayDefaults.name,
    source,
    divergence,
    turns,
    capture: false,
    resumable: true,
    forkable: false,
    usage: "events",
    get remainingTurns() {
      return turns.length - position;
    },
    nextTurn() {
      if (position >= turns.length) return undefined;
      return turns[position++];
    },
    pendingSteering() {
      return turns[position]?.resumedBy;
    },
  });
}

function replayRecording(journal: readonly unknown[]): ReplayRecording {
  const drafts: DraftTurn[] = [];
  let current: DraftTurn | undefined;
  let source: ReplayAgent["source"] = "agent";
  let finished: ReplayFailure | undefined;
  let replayable = false;
  for (const [index, entry] of journal.entries()) {
    const { origin, event, subagentId } = journalEvent(entry, index);
    if (event.kind === "workspace-commits") {
      replayable = true;
      const last = drafts.at(-1);
      if (last) last.changes = workspaceCommits(event, index);
      current = undefined;
      continue;
    }
    if (event.kind === "dispatch-finished") {
      finished = dispatchFailure(event, index);
      current = undefined;
      continue;
    }
    if (
      origin === "decision" &&
      current &&
      replayDecisionKinds.has(event.kind)
    ) {
      (current.decisionEvents ??= []).push({
        before: current.events.length,
        event: recordedDecision(event, index),
        ...(subagentId ? { subagentId } : {}),
      });
      continue;
    }
    if (origin !== "agent" && origin !== "harness") continue;
    if (event.kind === "fallback") {
      if (current) current.handover = fallbackEvent(event, index);
      current = undefined;
      continue;
    }
    if (origin === "harness") source = "harness";
    if (event.kind === "prompt") {
      if (current?.resumedBy && current.events.length === 0) {
        current.prompt = text(event, "text", index);
        continue;
      }
      current = {
        prompt: text(event, "text", index),
        events: [],
        texts: [],
        raws: [],
        observed: { input: 0, cached: 0, output: 0 },
      };
      drafts.push(current);
      continue;
    }
    if (!current) continue;
    if (event.kind === "summary") {
      const total = usage(event.tokens, index);
      current.usage = current.before
        ? usageDifference(total, current.before)
        : total;
      current = undefined;
      continue;
    }
    if (event.kind === "steer" && event.mode === "resumed") {
      current = resumed(current, text(event, "text", index));
      if (current !== drafts.at(-1)) drafts.push(current);
      continue;
    }
    if (event.kind === "stopped" && event.reason === "steered")
      current.interrupted = true;
    const agentEvent = event as unknown as AgentEvent;
    if (replayExecutionEvents.has(event.kind) || !isAgentEvent(agentEvent))
      continue;
    collect(current, event, index);
    current.events.push(agentEvent);
  }
  invariant(drafts.length > 0, "The replay journal contains no agent turns");
  if (!replayable)
    drafts.at(-1)!.changes = {
      kind: "workspace-commits",
      unavailable: replayDefaults.unrecorded,
    };
  return {
    turns: Object.freeze(drafts.map((draft) => turn(draft, finished))),
    source,
  };
}

function resumed(current: DraftTurn, instruction: string): DraftTurn {
  // Instructions delivered together form one resumed prompt.
  if (current.resumedBy && current.events.length === 0) {
    current.resumedBy.push(instruction);
    current.prompt = current.resumedBy.join("\n\n");
    return current;
  }
  current.continued = true;
  return {
    prompt: instruction,
    resumedBy: [instruction],
    before: addUsage(
      current.before ?? { input: 0, cached: 0, output: 0 },
      current.observed,
    ),
    events: [],
    texts: [],
    raws: [],
    observed: { input: 0, cached: 0, output: 0 },
  };
}

function turn(
  draft: DraftTurn,
  finished: ReplayFailure | undefined,
): ReplayTurn {
  const failure: ReplayFailure | undefined =
    draft.usage || draft.handover || draft.continued
      ? undefined
      : (finished ?? {
          code: "process",
          message: draft.failure ?? replayDefaults.unfinished,
        });
  return Object.freeze({
    prompt: draft.prompt,
    events: Object.freeze(draft.events),
    ...(draft.decisionEvents
      ? { decisionEvents: Object.freeze(draft.decisionEvents) }
      : {}),
    text:
      draft.result ??
      (draft.texts.length ? draft.texts.join("") : draft.raws.join("\n")),
    usage:
      draft.usage ??
      (draft.handover || draft.continued
        ? draft.observed
        : { input: 0, cached: 0, output: 0 }),
    ...(draft.conversation ? { conversation: draft.conversation } : {}),
    ...(failure ? { failure } : {}),
    ...(draft.handover ? { handover: draft.handover } : {}),
    ...(draft.changes ? { changes: draft.changes } : {}),
    ...(draft.resumedBy ? { resumedBy: Object.freeze(draft.resumedBy) } : {}),
    ...(draft.interrupted ? { interrupted: true } : {}),
  });
}

function collect(draft: DraftTurn, event: JournalObject, index: number): void {
  visitAgentEvent(event as unknown as AgentEvent, {
    text: () => draft.texts.push(text(event, "text", index)),
    result: () => {
      const value = text(event, "text", index);
      draft.result =
        draft.result === undefined ? value : `${draft.result}\n${value}`;
    },
    conversation: () => {
      draft.conversation = text(event, "id", index);
    },
    failure: () => {
      draft.failure = text(event, "message", index);
    },
    raw: () => {
      draft.raws.push(String(event.value));
    },
    usage: () => {
      draft.observed = addUsage(draft.observed, usage(event.tokens, index));
    },
  });
}

function journalEvent(entry: unknown, index: number): ReplayJournalEvent {
  const value = object(entry, index);
  invariant(
    typeof value.kind === "string",
    `Replay journal entry ${index} has no event kind`,
  );
  const event: Record<string, unknown> = {};
  for (const [key, field] of Object.entries(value))
    if (!replayJournalFields.has(key)) event[key] = field;
  const scope = value.scope;
  const subagentId =
    scope &&
    typeof scope === "object" &&
    "subagentId" in scope &&
    typeof scope.subagentId === "string"
      ? scope.subagentId
      : undefined;
  return {
    origin: value.source,
    event: event as ReplayJournalEvent["event"],
    ...(subagentId ? { subagentId } : {}),
  };
}

function recordedDecision(
  event: JournalObject,
  index: number,
): ReplayDecisionEvent["event"] {
  checkpointValue(event);
  if (event.kind === "decision-request") {
    invariant(
      Object.hasOwn(event, "request"),
      `Replay decision ${index} has no request`,
    );
    return { kind: "decision-request", request: event.request };
  }
  if (event.kind === "decision-response") {
    invariant(
      Object.hasOwn(event, "response"),
      `Replay decision ${index} has no response`,
    );
    return { kind: "decision-response", response: event.response };
  }
  invariant(
    event.kind === "decision",
    `Replay decision ${index} has an unsupported kind`,
  );
  invariant(
    event.status === "started" ||
      event.status === "finished" ||
      event.status === "failed",
    `Replay decision ${index} has an invalid status`,
  );
  invariant(
    event.durationMs === undefined ||
      (typeof event.durationMs === "number" && event.durationMs >= 0),
    `Replay decision ${index} has an invalid duration`,
  );
  invariant(
    event.truncated === undefined || typeof event.truncated === "boolean",
    `Replay decision ${index} has invalid truncation`,
  );
  invariant(
    event.code === undefined || typeof event.code === "string",
    `Replay decision ${index} has an invalid fault code`,
  );
  return {
    kind: "decision",
    status: event.status,
    provider: text(event, "provider", index),
    model: text(event, "model", index),
    ...(event.durationMs === undefined ? {} : { durationMs: event.durationMs }),
    ...(event.usage === undefined ? {} : { usage: usage(event.usage, index) }),
    ...(event.truncated === undefined ? {} : { truncated: event.truncated }),
    ...(event.code === undefined ? {} : { code: event.code }),
  };
}

function dispatchFailure(
  event: JournalObject,
  index: number,
): ReplayFailure | undefined {
  if (event.error === undefined) return undefined;
  const error = object(event.error, index);
  const code =
    typeof error.code === "string" && replayFaultCodes.has(error.code)
      ? (error.code as FaultCode)
      : "process";
  return { code, message: text(error, "message", index) };
}

function workspaceCommits(
  event: JournalObject,
  index: number,
): WorkspaceCommitsEvent {
  const baseline =
    event.baseline === undefined ? undefined : revision(event.baseline, index);
  if (event.unavailable !== undefined)
    return {
      kind: "workspace-commits",
      ...(baseline ? { baseline } : {}),
      unavailable: text(event, "unavailable", index),
    };
  invariant(
    baseline && Array.isArray(event.commits),
    `Replay journal entry ${index} has malformed workspace commits`,
  );
  return {
    kind: "workspace-commits",
    baseline,
    commits: event.commits.map((value: unknown) => commit(value, index)),
  };
}

function commit(value: unknown, index: number): RecordedCommit {
  const recorded = object(value, index);
  return {
    oid: text(recorded, "oid", index),
    tree: text(recorded, "tree", index),
    author: identity(recorded.author, index),
    committer: identity(recorded.committer, index),
    message: text(recorded, "message", index),
    patch: text(recorded, "patch", index),
  };
}

function revision(value: unknown, index: number): RecordedRevision {
  const recorded = object(value, index);
  return {
    commit: text(recorded, "commit", index),
    tree: text(recorded, "tree", index),
  };
}

function identity(value: unknown, index: number): RecordedIdentity {
  const recorded = object(value, index);
  return {
    name: text(recorded, "name", index),
    email: text(recorded, "email", index),
    date: text(recorded, "date", index),
  };
}

function usage(value: unknown, index: number): Usage {
  const recorded = object(value, index);
  const counts = ["input", "cached", "output", "cacheCreated"] as const;
  for (const key of counts)
    invariant(
      (key === "cacheCreated" && recorded[key] === undefined) ||
        (Number.isSafeInteger(recorded[key]) && (recorded[key] as number) >= 0),
      `Replay journal entry ${index} has invalid ${key} usage`,
    );
  invariant(
    recorded.complete === undefined || typeof recorded.complete === "boolean",
    `Replay journal entry ${index} has invalid usage completeness`,
  );
  return {
    input: recorded.input as number,
    cached: recorded.cached as number,
    output: recorded.output as number,
    ...(recorded.cacheCreated === undefined
      ? {}
      : { cacheCreated: recorded.cacheCreated as number }),
    ...(recorded.complete === undefined
      ? {}
      : { complete: recorded.complete as boolean }),
  };
}

function object(value: unknown, index: number): JournalObject {
  invariant(
    value !== null && typeof value === "object" && !Array.isArray(value),
    `Replay journal entry ${index} is malformed`,
  );
  return value as JournalObject;
}

function text(value: JournalObject, key: string, index: number): string {
  const field = value[key];
  invariant(
    typeof field === "string",
    `Replay journal entry ${index} requires a string ${key}`,
  );
  return field;
}

function fallbackEvent(event: JournalObject, index: number): FallbackEvent {
  const failure = text(event, "failure", index);
  invariant(
    fallbackTriggers.has(failure as FallbackTrigger),
    `Replay journal entry ${index} has an unknown fallback failure`,
  );
  return Object.freeze({
    kind: "fallback",
    from: candidate(event.from, index),
    to: candidate(event.to, index),
    failure: failure as FallbackTrigger,
    message: text(event, "message", index),
    ...(event.resetAt === undefined
      ? {}
      : { resetAt: text(event, "resetAt", index) }),
  });
}

function candidate(value: unknown, index: number): FallbackCandidate {
  const recorded = object(value, index);
  invariant(
    Number.isSafeInteger(recorded.index) && (recorded.index as number) >= 0,
    `Replay journal entry ${index} has an invalid fallback candidate`,
  );
  return Object.freeze({
    index: recorded.index as number,
    name: text(recorded, "name", index),
    ...(recorded.model === undefined
      ? {}
      : { model: text(recorded, "model", index) }),
  });
}
