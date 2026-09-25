import { readFile } from "node:fs/promises";
import type { ConversationRecord } from "../domain/conversation.types.ts";
import { invariant, recordRecovery } from "../domain/errors.ts";
import { git } from "../infrastructure/git/command.ts";
import { commits } from "../infrastructure/git/history.ts";
import { journal } from "../infrastructure/journal.ts";
import { storageFor } from "./agent-storage.ts";
import { warmContinuation } from "./continuation.ts";
import { preflightDispatch } from "./dispatch-validation.ts";
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
  const { options, provider, workspace, runtime, sync, stop, staging } =
    context;
  const { selectAgent, restore } = agents;
  await preflightDispatch(
    dispatch,
    workspace.repository,
    dispatch.agent ?? options.agent,
  );
  const signal = dispatch.signal
    ? AbortSignal.any([dispatch.signal, stop.signal])
    : stop.signal;
  const { selected, adapter, executionLease } = await selectAgent(
    dispatch.agent ?? options.agent,
    signal,
  );
  if (dispatch.continuation) await restore(dispatch.continuation.id, selected);
  const baseline = (
    await git(workspace.directory, ["rev-parse", "HEAD"])
  ).trim();
  const log = await journal(
    workspace.repository,
    dispatch.logging ?? options.logging,
    dispatch.label,
  );
  let execution: Execution<T> | undefined,
    transcript: ConversationRecord | undefined;
  const captured = new Map<string, ConversationRecord>();
  const storage = storageFor(selected);
  let failure: unknown;
  let conversation = dispatch.continuation?.id;
  const conversations = new Set<string>(conversation ? [conversation] : []);
  const save = async (id: string) => {
    invariant(storage, "Conversation storage is unavailable");
    const location = await storage.capture(id, {
      repository: workspace.repository,
      sandbox: runtime,
      staging,
      ...(options.conversationHome ? { home: options.conversationHome } : {}),
      ...(dispatch.warn ? { warn: dispatch.warn } : {}),
      local: provider.placement === "host",
    });
    captured.set(id, location);
    transcript = location;
    return location;
  };
  try {
    execution = await execute(
      workspace,
      executionLease,
      adapter,
      provider.placement === "host",
      {
        ...dispatch,
        signal,
        observe(event) {
          if (event.kind === "conversation") {
            conversation = event.id;
            conversations.add(event.id);
            agents.remember(selected, event.id);
          }
          log.record(event);
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
    log.record({
      kind: "failure",
      message: cause instanceof Error ? cause.message : String(cause),
    });
  }
  try {
    await sync?.pull();
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
  try {
    await log.close();
  } catch (cause) {
    failure ??= cause;
  }
  const changes = await commits(
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
      log: log.file,
      logReference: log.reference,
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
    ...(log.file ? { log: log.file } : {}),
    ...(log.reference ? { logReference: log.reference } : {}),
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
