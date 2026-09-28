import { observedOperation } from "../domain/observed-operation.ts";
import { readFile } from "node:fs/promises";
import type { ConversationRecord } from "../domain/conversation.types.ts";
import { invariant, recordRecovery } from "../domain/errors.ts";
import { git } from "../infrastructure/git/command.ts";
import { commits } from "../infrastructure/git/history.ts";
import { storageFor } from "./agent-storage.ts";
import { warmContinuation } from "./continuation.ts";
import { preflightDispatch } from "./dispatch-validation.ts";
import { recordReplayChanges } from "./replay-recording.ts";
import { execute } from "./execution.ts";
import type { DispatchOptions, Execution } from "./execution.types.ts";
import { notify } from "./observation.ts";
import type { Sandbox, WarmDispatchResult } from "./outpost.types.ts";
import type {
  ProvisionedSandbox,
  SandboxAgents,
} from "./sandbox-session.types.ts";

export async function dispatchInSandbox<T>(
  context: ProvisionedSandbox,
  agents: SandboxAgents,
  result: Sandbox,
  dispatch: DispatchOptions<T>,
): Promise<WarmDispatchResult<T>> {
  const { options, sandboxProvider, workspace, sync, stop, staging } = context;
  const { selectAgent, restore } = agents;
  await preflightDispatch(
    dispatch,
    workspace.repository,
    dispatch.agent ?? options.agent,
  );
  const signal = dispatch.signal
    ? AbortSignal.any([dispatch.signal, stop.signal])
    : stop.signal;
  const { selected, adapter, executionLease } = await observedOperation(
    dispatch.observation,
    "sandbox",
    "agent.prepare",
    async () =>
      selectAgent(
        dispatch.agent ?? options.agent,
        signal,
        dispatch.observation,
      ),
  );
  if (dispatch.continuation)
    await observedOperation(
      dispatch.observation,
      "conversation",
      "conversation.restore",
      async () => restore(dispatch.continuation!.id, selected, executionLease),
    );
  const baseline = (
    await git(workspace.directory, ["rev-parse", "HEAD"])
  ).trim();
  let execution: Execution<T> | undefined,
    transcript: ConversationRecord | undefined;
  const captured = new Map<string, ConversationRecord>();
  const storage = storageFor(selected);
  let failure: unknown;
  let conversation = dispatch.continuation?.id;
  const conversations = new Set<string>(
    conversation && !dispatch.continuation?.fork ? [conversation] : [],
  );
  const save = async (id: string) => {
    invariant(storage, "Conversation storage is unavailable");
    const location = await observedOperation(
      dispatch.observation,
      "conversation",
      "conversation.capture",
      async () =>
        storage.capture(id, {
          repository: workspace.repository,
          sandbox: executionLease,
          staging,
          ...(options.conversationHome
            ? { home: options.conversationHome }
            : {}),
          ...(dispatch.warn ? { warn: dispatch.warn } : {}),
          local: sandboxProvider.placement === "host",
        }),
    );
    captured.set(id, location);
    transcript = location;
    return location;
  };
  try {
    execution = await execute(
      workspace,
      executionLease,
      adapter,
      sandboxProvider.placement === "host",
      {
        ...dispatch,
        signal,
        observe(event) {
          if (event.kind === "conversation") {
            conversation = event.id;
            conversations.add(event.id);
            agents.remember(selected, event.id);
          }
          notify(dispatch.observe, event);
        },
      },
      async (turn) => {
        if (!turn.conversation || !storage || selected.capture === false)
          return turn;
        const location = await save(turn.conversation);
        const usage = selected.transcriptUsage?.(
          await readFile(location.file, "utf8"),
        );
        return {
          ...turn,
          transcript: location.file,
          ...(location.reference
            ? { transcriptReference: location.reference }
            : {}),
          ...(usage ? { usage } : {}),
        };
      },
    );
  } catch (cause) {
    failure = cause;
  }
  try {
    await observedOperation(
      dispatch.observation,
      "transfer",
      "repository.refresh",
      async () => sync?.pull(),
    );
    if (storage && selected.capture !== false)
      for (const id of conversations)
        if (failure || !captured.has(id)) await save(id);
  } catch (cause) {
    failure = failure
      ? new AggregateError(
          [failure, cause],
          "Execution and recovery both failed",
        )
      : cause;
  }
  const changes = await observedOperation(
    dispatch.observation,
    "git",
    "commits.collect",
    async () =>
      commits(workspace.directory, baseline, options.limits?.collectMs),
  );
  await recordReplayChanges(
    dispatch,
    workspace.directory,
    baseline,
    options.limits?.collectMs,
  );
  if (failure) {
    recordRecovery(failure, {
      branch: workspace.branch,
      directory: workspace.directory,
      commits: changes,
      transcript: transcript?.file,
      transcriptReference: transcript?.reference,
    });
    throw failure;
  }
  invariant(execution, "Execution did not produce a result");
  return {
    ...execution,
    branch: workspace.branch,
    directory: workspace.directory,
    commits: changes,
    ...(transcript ? { transcript: transcript.file } : {}),
    ...(transcript?.reference
      ? { transcriptReference: transcript.reference }
      : {}),
    resume<U>(next: DispatchOptions<U>) {
      warmContinuation(next);
      invariant(conversation, "No conversation was emitted");
      return result.resume(conversation, { agent: selected, ...next });
    },
    fork<U>(next: DispatchOptions<U>) {
      warmContinuation(next);
      invariant(conversation, "No conversation was emitted");
      return result.fork(conversation, { agent: selected, ...next });
    },
  };
}
