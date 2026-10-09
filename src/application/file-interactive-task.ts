import { createHash } from "node:crypto";
import { invariant } from "../domain/errors.ts";
import { checkpointValue } from "../domain/workflow/checkpoint-value.ts";
import { defineTask } from "../domain/workflow/task.ts";
import { positive } from "../domain/workflow/validation.ts";
import type { Task } from "../domain/workflow.types.ts";
import type { WorkflowJson } from "../domain/workflow/checkpoint.types.ts";
import { storageFor } from "./agent-storage.ts";
import { createFileWorkspace } from "./file-workspace.ts";
import { restoreManagedFileWorkspace } from "./task-file-workspace.ts";
import { createFileSandbox, validateFileAgent } from "./file-sandbox.ts";
import { assertFileWorkspaceRecord } from "./task-file-workspace.ts";
import {
  interactiveTaskDefaults,
  interactiveTurnInstructions,
} from "./interactive-task.constants.ts";
import { interactiveResponse } from "./interactive-task-protocol.ts";
import { quotaResumeInstructions } from "./quota-resume.constants.ts";
import { taskUsage } from "./task-usage.ts";
import { fileWorkspaces } from "./file-workspace-registry.ts";
import type {
  FileInteractiveAgentTaskOptions,
  FileInteractiveAgentResult,
  FileInteractiveAgentState,
} from "./interactive-task.types.ts";

function json(value: unknown): WorkflowJson {
  const saved = checkpointValue(value);
  invariant(saved.kind === "json", "Interactive workspace state must be JSON");
  return saved.value;
}

function state(value: unknown): FileInteractiveAgentState | undefined {
  if (value === undefined) return undefined;
  invariant(
    value &&
      typeof value === "object" &&
      "format" in value &&
      value.format === 1 &&
      "turns" in value &&
      typeof value.turns === "number" &&
      Number.isSafeInteger(value.turns) &&
      value.turns >= 0 &&
      "workspaceInfo" in value,
    "Invalid file interaction state",
  );
  assertFileWorkspaceRecord(value.workspaceInfo);
  const conversation = "conversation" in value ? value.conversation : undefined;
  invariant(
    conversation === undefined ||
      (typeof conversation === "string" && !!conversation),
    "Invalid file conversation checkpoint",
  );
  invariant(
    value.turns === 0 || conversation,
    "Completed turns require a conversation",
  );
  if ("completed" in value) {
    const result = value.completed;
    invariant(
      result &&
        typeof result === "object" &&
        "output" in result &&
        "conversation" in result &&
        typeof result.conversation === "string" &&
        result.conversation === conversation &&
        "directory" in result &&
        result.directory === value.workspaceInfo.directory &&
        "turns" in result &&
        result.turns === value.turns &&
        "workspaceInfo" in result,
      "Invalid completed file interaction",
    );
    assertFileWorkspaceRecord(result.workspaceInfo);
    return {
      format: 1,
      turns: value.turns,
      workspaceInfo: value.workspaceInfo,
      ...(conversation ? { conversation } : {}),
      completed: {
        output: json(result.output),
        conversation: result.conversation,
        directory: result.directory,
        turns: result.turns,
        workspaceInfo: result.workspaceInfo,
      },
    };
  }
  return {
    format: 1,
    turns: value.turns,
    workspaceInfo: value.workspaceInfo,
    ...(conversation ? { conversation } : {}),
  };
}

export function defineFileInteractiveAgentTask(
  options: FileInteractiveAgentTaskOptions,
): Task<FileInteractiveAgentResult> {
  invariant(options.brief.trim(), "Interactive tasks require a brief");
  invariant(
    options.agent.resumable !== false &&
      options.agent.capture !== false &&
      storageFor(options.agent),
    "Interactive tasks require portable conversation capture and resume",
  );
  const maxTurns = options.maxTurns ?? interactiveTaskDefaults.maxTurns;
  positive(maxTurns, "maxTurns");
  const identity = createHash("sha256")
    .update(
      JSON.stringify({
        format: "file-interaction-1",
        source: options.workspaceSource,
        runtime: options.runtime?.namespace,
        agent: options.agent.name,
        model: "model" in options.agent ? options.agent.model : undefined,
        brief: options.brief,
        maxTurns,
      }),
    )
    .digest("hex");
  return defineTask({
    key: options.key,
    ...(options.after ? { after: options.after } : {}),
    ...(options.timeoutMs ? { timeoutMs: options.timeoutMs } : {}),
    interaction: { identity, actors: options.actors },
    async perform(context) {
      const interaction = context.interaction;
      invariant(
        interaction,
        "Interactive tasks must run in a checkpointed workflow",
      );
      const previous = state(interaction.state);
      if (previous?.completed) return previous.completed;
      invariant(
        (previous?.turns ?? 0) < maxTurns,
        "Interactive task exceeded maxTurns",
      );
      if (previous?.conversation)
        invariant(interaction.answer, "A human answer is required to continue");
      await validateFileAgent(options.agent);
      const workspace = previous
        ? await restoreManagedFileWorkspace(
            previous.workspaceInfo,
            options,
            options.sandboxProvider,
          )
        : await createFileWorkspace({
            ...options,
            source: options.workspaceSource,
            signal: context.signal,
          });
      let current: FileInteractiveAgentState = {
        ...(previous ?? { format: 1, turns: 0 }),
        workspaceInfo: await workspace.checkpoint(),
      };
      try {
        await interaction.save(json(current));
        const sandbox = await createFileSandbox(
          {
            workspace,
            agent: options.agent,
            sandboxProvider: options.sandboxProvider,
            signal: context.signal,
          },
          async (record) => {
            current = { ...current, workspaceInfo: record };
            await context.workspaceCheckpoint?.write(
              `interactive:${options.key}`,
              json(record),
            );
            await interaction.save(json(current));
          },
        );
        try {
          const usage = taskUsage(context, undefined);
          const interrupted = context.quota?.conversation;
          const conversation = interrupted ?? current.conversation;
          const input = interrupted
            ? quotaResumeInstructions
            : conversation
              ? `Human answer (JSON): ${JSON.stringify(interaction.answer!.value)}`
              : options.brief;
          const result = await sandbox.dispatch({
            brief: { text: `${input}\n\n${interactiveTurnInstructions}` },
            response: interactiveResponse,
            signal: context.signal,
            observe: usage.observe,
            ...(context.observation
              ? { observation: context.observation }
              : {}),
            ...(context.prices ? { prices: context.prices } : {}),
            ...(conversation ? { continuation: { id: conversation } } : {}),
          });
          usage.reconcile(result.usage);
          context.signal.throwIfAborted();
          invariant(
            result.conversation && result.transcript,
            "Interactive turn did not capture a portable conversation",
          );
          current = {
            ...current,
            turns: current.turns + 1,
            conversation: result.conversation,
            workspaceInfo: result.workspaceInfo,
          };
          await sandbox.close({ preserve: true });
          await workspace.close({ preserve: result.value.kind === "question" });
          current = {
            ...current,
            workspaceInfo: fileWorkspaces.get(workspace)!.record,
          };
          if (result.value.kind === "question") {
            await interaction.save(json(current));
            invariant(
              current.turns < maxTurns,
              "Interactive task exceeded maxTurns before completion",
            );
            return interaction.suspend(result.value, json(current));
          }
          const completed: FileInteractiveAgentResult = {
            output: result.value.output,
            conversation: result.conversation,
            directory: workspace.directory,
            turns: current.turns,
            workspaceInfo: current.workspaceInfo,
          };
          await interaction.save(json({ ...current, completed }));
          return completed;
        } finally {
          await sandbox.close({ preserve: true });
        }
      } finally {
        await workspace.close({ preserve: true });
      }
    },
  });
}
