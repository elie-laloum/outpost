import { profilePermissions } from "../domain/agent-profile-permissions.ts";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { invariant, OutpostError, recordRecovery } from "../domain/errors.ts";
import { hooks, runHook } from "./harness-hooks.ts";
import { MAX_DELEGATION_DEPTH } from "../domain/subagent.constants.ts";
import type { HarnessSubagent } from "../domain/subagent.types.ts";
import type { HarnessToolContext } from "../domain/tool.types.ts";
import { openTranscript } from "../infrastructure/conversations/harness-transcript.ts";
import type { TranscriptHandle } from "../infrastructure/conversations/harness-transcript.types.ts";
import { storageFor } from "./agent-storage.ts";
import { harnessBudget } from "./harness-budget.ts";
import { harnessHistory } from "./harness-history.ts";
import { harnessLoop } from "./harness-loop.ts";
import { withMcpTools } from "./harness-mcp.ts";
import { harnessModelProvider } from "./harness-model-provider.ts";
import type { HarnessRuntime } from "./harness.types.ts";

export async function runSubagent(
  runtime: HarnessRuntime,
  tool: HarnessSubagent,
  input: unknown,
  context: HarnessToolContext,
  step = 0,
): Promise<string> {
  const validated = await tool.validate(input);
  if ("issues" in validated)
    throw new OutpostError("configuration", validated.issues);
  if (runtime.depth >= runtime.maxDepth)
    throw new OutpostError(
      "limit",
      "Harness reached its delegation depth limit",
      { limit: "maxDelegationDepth" },
    );
  runtime.budget.check();
  const agent = tool.subagent;
  const budget = harnessBudget(agent.harness.limits, runtime.budget);
  const id = randomUUID();
  let prompt = validated.value.prompt;
  const hookRuntime = {
    ...runtime,
    signal: context.signal,
    sandbox: context.sandbox,
  };
  for (const hook of hooks(runtime, "before-subagent")) {
    const decision = await runHook(
      hookRuntime,
      hook,
      { id, name: tool.name, callId: context.callId, prompt },
      step,
    );
    if (decision === undefined) continue;
    invariant(
      !("deny" in decision),
      "deny" in decision ? decision.deny : "Subagent denied",
    );
    prompt = decision.prompt;
  }
  const depth = runtime.depth + 1;
  const store = storageFor(agent);
  let transcript: TranscriptHandle | undefined;
  let failure: unknown;
  let text = "";
  let lifecycleSettled = false;
  const lifecycle = (status: "started" | "finished" | "failed") => {
    if (lifecycleSettled) return;
    if (status !== "started") lifecycleSettled = true;
    runtime.emit({
      kind: "subagent",
      id,
      callId: context.callId,
      name: tool.name,
      status,
      ...(transcript ? { conversation: transcript.id } : {}),
    });
  };
  const aborted = () => {
    if (!runtime.signal.aborted) lifecycle("failed");
  };
  try {
    transcript = store
      ? await openTranscript({
          repository: runtime.repository,
          ...(runtime.runtimeDirectory
            ? { runtimeDirectory: runtime.runtimeDirectory }
            : {}),
          ...(runtime.observation ? { observation: runtime.observation } : {}),
          store,
          model: agent.model.name,
          routed: Boolean(agent.harness.routing),
          ...(runtime.conversation
            ? { parentConversation: runtime.conversation }
            : {}),
          parentCallId: context.callId,
        })
      : undefined;
    lifecycle("started");
    context.signal.addEventListener("abort", aborted, { once: true });
    if (context.signal.aborted) aborted();
    text = await withMcpTools(
      agent.harness,
      context.sandbox,
      context.signal,
      agent.harness.tools,
      (tools, mcp) =>
        harnessLoop(
          {
            ...runtime,
            startSource: "start",
            responseInstructions: undefined,
            agent,
            observation: runtime.observation?.child({ subagentId: id }),
            mcp,
            budget,
            depth,
            maxDepth: Math.min(
              runtime.maxDepth,
              depth +
                (agent.harness.limits.maxDelegationDepth ??
                  MAX_DELEGATION_DEPTH),
            ),
            conversation: transcript?.id,
            subagentId: id,
            tools,
            permissions: [
              ...runtime.permissions,
              ...profilePermissions(
                agent.harness.profile,
                agent.harness.mcpServers,
              ),
              ...(agent.harness.permissions ? [agent.harness.permissions] : []),
            ],
            sandbox: context.sandbox,
            signal: context.signal,
            modelProvider: harnessModelProvider({
              agent,
              signal: context.signal,
              budget,
              ...runtime.modelScope,
              account: (result) => runtime.modelScope.account(result, id),
            }),
            emit: (event) => {
              context.signal.throwIfAborted();
              runtime.emit({ ...event, subagentId: event.subagentId ?? id });
            },
          },
          prompt,
          harnessHistory(transcript),
        ),
    );
    context.signal.throwIfAborted();
  } catch (error) {
    failure = error;
  }
  runtime.steering?.finish(id);
  try {
    if (transcript && store)
      await store.capture(transcript.id, {
        repository: runtime.repository,
        ...(runtime.runtimeDirectory
          ? { runtimeDirectory: runtime.runtimeDirectory }
          : {}),
        sandbox: context.sandbox,
        staging: join(
          runtime.runtimeDirectory ?? join(runtime.repository, ".outpost"),
          "conversations",
          "harness",
        ),
      });
  } catch (error) {
    if (failure)
      recordRecovery(failure, {
        subagentCaptureError: error,
        conversation: transcript?.id,
      });
    failure ??= error;
  } finally {
    context.signal.removeEventListener("abort", aborted);
    await transcript?.close();
  }
  try {
    for (const hook of hooks(runtime, "after-subagent")) {
      const decision = await runHook(
        hookRuntime,
        hook,
        {
          id,
          name: tool.name,
          callId: context.callId,
          ...(failure ? { error: failure } : { text }),
          ...(transcript ? { conversation: transcript.id } : {}),
        },
        step,
      );
      if (decision === undefined) continue;
      invariant(
        !failure,
        "after-subagent cannot replace a failed subagent result",
      );
      text = decision.text;
    }
  } catch (error) {
    if (failure) recordRecovery(failure, { afterSubagentHookError: error });
    failure ??= error;
  }
  if (failure) {
    if (!runtime.signal.aborted && !context.signal.aborted) lifecycle("failed");
    throw failure;
  }
  context.signal.throwIfAborted();
  lifecycle("finished");
  return JSON.stringify({
    text,
    ...(transcript ? { conversation: transcript.id } : {}),
  });
}
