import { isAgentEvent } from "./agent-observation.ts";
import { visitAgentEvent } from "./agent-events.ts";
import type { AgentEvent, Usage } from "./agent.types.ts";
import { invariant, OutpostError } from "./errors.ts";
import type { FaultCode } from "./errors.types.ts";
import {
  replayDefaults,
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
  JournalObject,
  ReplayJournalEvent,
  ReplayRecording,
  ReplayTurn,
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

export function replayAgent(options: ReplayAgentOptions): ReplayAgent {
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
  });
}

function replayRecording(journal: readonly unknown[]): ReplayRecording {
  const drafts: DraftTurn[] = [];
  let current: DraftTurn | undefined;
  let source: ReplayAgent["source"] = "agent";
  let finished: ReplayFailure | undefined;
  let replayable = false;
  for (const [index, entry] of journal.entries()) {
    const { origin, event } = journalEvent(entry, index);
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
    if (origin !== "agent" && origin !== "harness") continue;
    if (origin === "harness") source = "harness";
    if (event.kind === "prompt") {
      current = {
        prompt: text(event, "text", index),
        events: [],
        texts: [],
        raws: [],
      };
      drafts.push(current);
      continue;
    }
    if (!current) continue;
    if (event.kind === "summary") {
      current.usage = usage(event.tokens, index);
      current = undefined;
      continue;
    }
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

function turn(
  draft: DraftTurn,
  finished: ReplayFailure | undefined,
): ReplayTurn {
  const failure: ReplayFailure | undefined = draft.usage
    ? undefined
    : (finished ?? {
        code: "process",
        message: draft.failure ?? replayDefaults.unfinished,
      });
  return Object.freeze({
    prompt: draft.prompt,
    events: Object.freeze(draft.events),
    text:
      draft.result ??
      (draft.texts.length ? draft.texts.join("") : draft.raws.join("\n")),
    usage: draft.usage ?? { input: 0, cached: 0, output: 0 },
    ...(draft.conversation ? { conversation: draft.conversation } : {}),
    ...(failure ? { failure } : {}),
    ...(draft.changes ? { changes: draft.changes } : {}),
  });
}

function collect(draft: DraftTurn, event: JournalObject, index: number): void {
  visitAgentEvent(event as unknown as AgentEvent, {
    text: () => draft.texts.push(text(event, "text", index)),
    result: () => {
      draft.result = text(event, "text", index);
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
  return { origin: value.source, event: event as ReplayJournalEvent["event"] };
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
