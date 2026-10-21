import { randomUUID } from "node:crypto";
import { basename, dirname, join, relative } from "node:path";
import { invariant } from "../domain/errors.ts";
import { dispatchCandidates } from "../domain/fallback-agent.ts";
import type { ConversationRecord } from "../domain/conversation.types.ts";
import { addUsage } from "../domain/usage.ts";
import { inside } from "../infrastructure/files.ts";
import { createLocalTransport } from "../infrastructure/local-transport.ts";
import { archiveFiles } from "../infrastructure/transport-archive.ts";
import { createAgentConversations } from "./agent-conversations.ts";
import { runWithFallback } from "./agent-fallback.ts";
import type { DispatchExecutionContext } from "./dispatch-context.types.ts";
import { observeDispatch } from "./dispatch-observation.ts";
import { execute } from "./execution.ts";
import type { DispatchOptions } from "./execution.types.ts";
import { validateFileAgent } from "./file-agent-validation.ts";
import { createFileRunReport, fileRunReportData } from "./file-run-report.ts";
import type {
  FileSandboxDispatch,
  FileSandboxDispatchContext,
} from "./file-sandbox-context.types.ts";
import type { FileDispatchResult } from "./file-sandbox.types.ts";
import type {
  FileWorkspace,
  FileWorkspaceState,
} from "./file-workspace.types.ts";
import { steeringScope } from "./steering-scope.ts";

/** Runs agent dispatches on a provisioned file sandbox, settling files after each one. */
export function createFileSandboxDispatch({
  options,
  workspace,
  state,
  signal,
  gate,
  settlement,
  agents,
  sandbox,
}: FileSandboxDispatchContext): FileSandboxDispatch {
  return function dispatch<T>(
    settings: DispatchOptions<T>,
    executionContext?: DispatchExecutionContext,
  ) {
    const logging = settings.logging ?? options.logging;
    const log =
      logging === false || logging === "stdout"
        ? logging
        : {
            ...logging,
            transporter:
              logging?.transporter ??
              createLocalTransport({
                directory: join(workspace.runtime.directory, "storage"),
              }),
          };
    return steeringScope(settings.steering, () =>
      gate.run(() =>
        observeDispatch(
          {
            ...settings,
            logging: log,
            ...((settings.observation ?? options.observation)
              ? { observation: settings.observation ?? options.observation }
              : {}),
          },
          async (settings) => {
            const requested = settings.agent ?? options.agent;
            invariant(requested, "Provide an agent");
            invariant(
              requested.kind !== "fallback" || !settings.continuation,
              "Fallback agents cannot continue a conversation",
            );
            for (const agent of dispatchCandidates(requested))
              await validateFileAgent(agent, settings);
            const executed = await settlement.settled(async () =>
              runWithFallback(
                requested,
                settings.observe,
                signal,
                async (agent, observe) => {
                  const { executionLease } = await agents.prepare(
                    agent,
                    signal,
                  );
                  const conversations = createAgentConversations({
                    agent,
                    context: agents.conversationContext(executionLease),
                  });
                  if (settings.continuation)
                    await agents.restore(
                      settings.continuation.id,
                      agent,
                      executionLease,
                    );
                  const execution = await execute(
                    {
                      directory: workspace.directory,
                      projectDirectory: workspace.runtime.directory,
                      runtimeDirectory: workspace.runtime.directory,
                    },
                    executionLease,
                    agent,
                    options.sandboxProvider.placement === "host",
                    {
                      ...settings,
                      signal: settings.signal
                        ? AbortSignal.any([settings.signal, signal])
                        : signal,
                      observe,
                    },
                    async (turn) => {
                      await settlement.synchronize();
                      if (turn.conversation)
                        agents.remember(agent, turn.conversation);
                      const capturedTurn =
                        await conversations.captureTurn(turn);
                      const captured = turn.conversation
                        ? conversations.captured.get(turn.conversation)
                        : undefined;
                      if (captured && turn.conversation) {
                        await archivePortableConversation(
                          workspace,
                          state,
                          captured,
                        );
                        agents.remember(agent, turn.conversation);
                        await settlement.checkpoint();
                        return capturedTurn;
                      }
                      await settlement.checkpoint();
                      return turn;
                    },
                  );
                  return { execution, agent };
                },
              ),
            );
            const { execution, agent } = executed.value;
            const captured = execution.turns.findLast(
              (turn) => turn.transcript,
            );
            const outcome: FileDispatchResult<typeof execution.value> = {
              ...execution,
              usage: addUsage(execution.usage, executed.failedUsage),
              workspaceInfo: state.record,
              directory: workspace.directory,
              fileOutputs: [],
              ...(captured?.transcript
                ? { transcript: captured.transcript }
                : {}),
              ...(captured?.transcriptReference
                ? { transcriptReference: captured.transcriptReference }
                : {}),
              ...(executed.fallback ? { fallback: executed.fallback } : {}),
              ...createFileRunReport(
                fileRunReportData({
                  ...execution,
                  usage: addUsage(execution.usage, executed.failedUsage),
                  workspaceInfo: state.record,
                  fileOutputs: [],
                }),
              ),
              resume(next) {
                invariant(
                  execution.conversation,
                  "No conversation was emitted",
                );
                return sandbox().resume(execution.conversation, {
                  ...next,
                  agent,
                });
              },
              fork(next) {
                invariant(
                  execution.conversation,
                  "No conversation was emitted",
                );
                return sandbox().fork(execution.conversation, {
                  ...next,
                  agent,
                });
              },
            };
            return outcome;
          },
          workspace.runtime.directory,
          executionContext,
        ),
      ),
    );
  };
}

async function archivePortableConversation(
  workspace: FileWorkspace,
  state: FileWorkspaceState,
  captured: ConversationRecord,
): Promise<void> {
  const retention = state.options.retention;
  if (retention?.policy !== "portable") return;
  invariant(
    inside(workspace.runtime.directory, captured.file),
    "Portable conversations must be captured inside the runtime directory",
  );
  const reference = await archiveFiles(
    retention.transporter,
    dirname(captured.file),
    [basename(captured.file)],
    `conversations/${workspace.runtime.namespace}/${workspace.id}/${randomUUID()}`,
  );
  state.record = {
    ...state.record,
    conversations: [
      ...(state.record.conversations ?? []).filter(
        (record) => record.id !== captured.id,
      ),
      {
        id: captured.id,
        format: captured.format,
        path: relative(workspace.runtime.directory, captured.file)
          .split("\\")
          .join("/"),
        archive: {
          key: reference.key,
          revision: reference.revision,
        },
      },
    ],
  };
}
