import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { OutpostError, recordRecovery } from "../domain/errors.ts";
import { MAX_DELEGATION_DEPTH } from "../domain/subagent.constants.ts";
import type { HarnessSubagent } from "../domain/subagent.types.ts";
import type { HarnessToolContext } from "../domain/tool.types.ts";
import { openTranscript } from "../infrastructure/conversations/harness-transcript.ts";
import type { TranscriptHandle } from "../infrastructure/conversations/harness-transcript.types.ts";
import { storageFor } from "./agent-storage.ts";
import { harnessBudget } from "./harness-budget.ts";
import { harnessHistory } from "./harness-history.ts";
import { harnessLoop } from "./harness-loop.ts";
import { harnessModelProvider } from "./harness-model-provider.ts";
import type { HarnessRuntime } from "./harness.types.ts";

export async function runSubagent(
  runtime: HarnessRuntime,
  tool: HarnessSubagent,
  input: unknown,
  context: HarnessToolContext,
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
  const depth = runtime.depth + 1;
  const store = storageFor(agent);
  let transcript: TranscriptHandle | undefined;
  let failure: unknown;
  let text = "";
  const lifecycle = (status: "started" | "finished" | "failed") =>
    runtime.emit({
      kind: "subagent",
      id,
      callId: context.callId,
      name: tool.name,
      status,
      ...(transcript ? { conversation: transcript.id } : {}),
    });
  try {
    transcript = store
      ? await openTranscript({
          repository: runtime.repository,
          store,
          model: agent.model.name,
          ...(runtime.conversation
            ? { parentConversation: runtime.conversation }
            : {}),
          parentCallId: context.callId,
        })
      : undefined;
    lifecycle("started");
    text = await harnessLoop(
      {
        ...runtime,
        agent,
        budget,
        depth,
        maxDepth: Math.min(
          runtime.maxDepth,
          depth +
            (agent.harness.limits.maxDelegationDepth ?? MAX_DELEGATION_DEPTH),
        ),
        conversation: transcript?.id,
        tools: agent.harness.tools,
        permissions: [
          ...runtime.permissions,
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
      validated.value.prompt,
      harnessHistory(transcript),
    );
    context.signal.throwIfAborted();
  } catch (error) {
    failure = error;
  }
  try {
    if (transcript && store)
      await store.capture(transcript.id, {
        repository: runtime.repository,
        sandbox: context.sandbox,
        staging: join(
          runtime.repository,
          ".outpost",
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
    await transcript?.close();
  }
  if (failure) {
    if (!runtime.signal.aborted) lifecycle("failed");
    throw failure;
  }
  context.signal.throwIfAborted();
  lifecycle("finished");
  return JSON.stringify({
    text,
    ...(transcript ? { conversation: transcript.id } : {}),
  });
}
