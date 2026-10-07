import { createRunReport, collectRunReportDiff } from "./run-report.ts";
import type { RunReportDiff } from "../domain/run-report.types.ts";
import { observedOperation } from "../domain/observed-operation.ts";
import { readFile } from "node:fs/promises";
import type { Agent } from "../domain/agent.types.ts";
import type { ConversationRecord } from "../domain/conversation.types.ts";
import { invariant, recordRecovery } from "../domain/errors.ts";
import { dispatchCandidates } from "../domain/fallback-agent.ts";
import { addUsage, modelUsage } from "../domain/usage.ts";
import { git } from "../infrastructure/git/command.ts";
import { commits } from "../infrastructure/git/history.ts";
import { runWithFallback } from "./agent-fallback.ts";
import { storageFor } from "./agent-storage.ts";
import { warmContinuation } from "./continuation.ts";
import { preflightDispatch } from "./dispatch-validation.ts";
import { recordReplayChanges } from "./replay-recording.ts";
import { execute } from "./execution.ts";
import type { DispatchOptions } from "./execution.types.ts";
import type { Sandbox, WarmDispatchResult } from "./outpost.types.ts";
import type {
  CandidateExecution,
  CandidateSession,
  PreparedCandidate,
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
  const requested = dispatch.agent ?? options.agent;
  invariant(requested, "Provide an agent on the sandbox or this operation");
  invariant(
    requested.kind !== "fallback" || !dispatch.continuation,
    "Fallback agents cannot continue a conversation; resume with the agent that produced it",
  );
  for (const candidate of dispatchCandidates(requested))
    await preflightDispatch(dispatch, workspace.repository, candidate);
  const signal = dispatch.signal
    ? AbortSignal.any([dispatch.signal, stop.signal])
    : stop.signal;
  const sessions: CandidateSession[] = [];
  let transcript: ConversationRecord | undefined;
  const prepare = async (requestedAgent: Agent): Promise<PreparedCandidate> => {
    const { selected, adapter, executionLease } = await observedOperation(
      dispatch.observation,
      "sandbox",
      "agent.prepare",
      async () => selectAgent(requestedAgent, signal, dispatch.observation),
    );
    const storage = storageFor(selected);
    const continued = dispatch.continuation;
    const session: CandidateSession = {
      selected,
      conversations: new Set(
        continued && !continued.fork ? [continued.id] : [],
      ),
      captured: new Map(),
      conversation: continued?.id,
      async save(id) {
        invariant(storage, "Conversation storage is unavailable");
        const location = await observedOperation(
          dispatch.observation,
          "conversation",
          "conversation.capture",
          async () =>
            storage.capture(id, {
              repository: workspace.repository,
              ...(dispatch.observation
                ? { observation: dispatch.observation }
                : {}),
              sandbox: executionLease,
              staging,
              ...(options.conversationHome
                ? { home: options.conversationHome }
                : {}),
              ...(dispatch.warn ? { warn: dispatch.warn } : {}),
              local: sandboxProvider.placement === "host",
            }),
        );
        session.captured.set(id, location);
        transcript = location;
        return location;
      },
    };
    sessions.push(session);
    if (continued)
      await observedOperation(
        dispatch.observation,
        "conversation",
        "conversation.restore",
        async () => restore(continued.id, selected, executionLease),
      );
    return { session, adapter, executionLease };
  };
  let initial: PreparedCandidate | undefined = await prepare(
    dispatchCandidates(requested)[0]!,
  );
  const baseline = (
    await git(workspace.directory, ["rev-parse", "HEAD"])
  ).trim();
  const run = async (
    requestedAgent: Agent,
    observe: NonNullable<DispatchOptions["observe"]>,
  ): Promise<CandidateExecution<T>> => {
    const prepared =
      initial?.session.selected === requestedAgent
        ? initial
        : await prepare(requestedAgent);
    initial = undefined;
    const { session, adapter, executionLease } = prepared;
    const { selected } = session;
    const storage = storageFor(selected);
    const execution = await execute(
      workspace,
      executionLease,
      adapter,
      sandboxProvider.placement === "host",
      {
        ...dispatch,
        signal,
        observe(event) {
          if (event.kind === "conversation") {
            session.conversation = event.id;
            session.conversations.add(event.id);
            agents.remember(selected, event.id);
          }
          observe(event);
        },
      },
      async (turn) => {
        if (!turn.conversation || !storage || selected.capture === false)
          return turn;
        const location = await session.save(turn.conversation);
        const usage = selected.transcriptUsage?.(
          await readFile(location.file, "utf8"),
        );
        return {
          ...turn,
          transcript: location.file,
          ...(location.reference
            ? { transcriptReference: location.reference }
            : {}),
          ...(usage
            ? {
                usage: dispatch.prices
                  ? modelUsage(
                      usage,
                      selected.kind === "replay"
                        ? undefined
                        : selected.model?.name,
                      selected.usageInput !== "uncached",
                    )
                  : usage,
              }
            : {}),
        };
      },
    );
    return { session, execution };
  };
  let outcome: CandidateExecution<T> | undefined;
  let failure: unknown;
  try {
    const { value, failedUsage, fallback } = await runWithFallback(
      requested,
      dispatch.observe,
      signal,
      run,
    );
    outcome = {
      session: value.session,
      execution: fallback
        ? {
            ...value.execution,
            usage: addUsage(failedUsage, value.execution.usage),
          }
        : value.execution,
      ...(fallback ? { fallback } : {}),
    };
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
    for (const session of sessions)
      if (session.selected.capture !== false && storageFor(session.selected))
        for (const id of session.conversations)
          if (failure || !session.captured.has(id)) await session.save(id);
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
  invariant(outcome, "Execution did not produce a result");
  const { session, execution, fallback } = outcome;
  try {
    await context.state.lease.checkGuard();
  } catch (cause) {
    recordRecovery(cause, {
      branch: workspace.branch,
      directory: workspace.directory,
      commits: changes,
      transcript: transcript?.file,
      transcriptReference: transcript?.reference,
    });
    throw cause;
  }
  const { selected } = session;
  let diff: RunReportDiff | null = null;
  const warnings: string[] = [];
  try {
    const head = (
      await git(
        workspace.directory,
        ["rev-parse", "HEAD"],
        options.limits?.collectMs,
      )
    ).trim();
    diff = await collectRunReportDiff(
      workspace.directory,
      baseline,
      head,
      options.limits?.collectMs,
    );
  } catch {
    warnings.push("Committed diff statistics could not be collected.");
  }
  return {
    report: createRunReport({
      version: 1,
      completed: execution.completed,
      text: execution.text,
      branch: workspace.branch,
      commits: changes,
      durationMs: execution.turns.reduce(
        (sum, turn) => sum + turn.durationMs,
        0,
      ),
      usage: execution.usage,
      cost: null,
      diff,
      failedTools: [],
      omittedFailures: 0,
      warnings,
    }),
    ...execution,
    branch: workspace.branch,
    directory: workspace.directory,
    commits: changes,
    ...(transcript ? { transcript: transcript.file } : {}),
    ...(transcript?.reference
      ? { transcriptReference: transcript.reference }
      : {}),
    ...(fallback ? { fallback } : {}),
    resume<U>(next: DispatchOptions<U>) {
      warmContinuation(next);
      invariant(session.conversation, "No conversation was emitted");
      return result.resume(session.conversation, { agent: selected, ...next });
    },
    fork<U>(next: DispatchOptions<U>) {
      warmContinuation(next);
      invariant(session.conversation, "No conversation was emitted");
      return result.fork(session.conversation, { agent: selected, ...next });
    },
  };
}
