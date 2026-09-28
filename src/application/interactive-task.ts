import { executeInteractiveTurn } from "./interactive-task-execution.ts";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { invariant } from "../domain/errors.ts";
import { task } from "../domain/workflow/task.ts";
import { positive } from "../domain/workflow/validation.ts";
import type { Task, TaskContext } from "../domain/workflow.types.ts";
import { directory } from "../infrastructure/files.ts";
import { git } from "../infrastructure/git/command.ts";
import { storageFor } from "./agent-storage.ts";
import { interactiveTaskDefaults } from "./interactive-task.constants.ts";
import { interactiveState } from "./interactive-task-protocol.ts";
import type {
  InteractiveAgentTaskOptions,
  InteractiveAgentResult,
} from "./interactive-task.types.ts";

export function interactiveAgentTask(
  options: InteractiveAgentTaskOptions,
): Task<InteractiveAgentResult> {
  invariant(
    typeof options.repository === "string" && !!options.repository.trim(),
    "Interactive tasks require a repository",
  );
  invariant(
    typeof options.brief === "string" && !!options.brief.trim(),
    "Interactive tasks require a brief",
  );
  const maxTurns = options.maxTurns ?? interactiveTaskDefaults.maxTurns;
  positive(maxTurns, "maxTurns");
  const selected = options.agent;
  invariant(
    selected.resumable !== false &&
      selected.capture !== false &&
      storageFor(selected),
    "Interactive tasks require portable conversation capture and resume",
  );
  const settings = {
    ...options,
    repository: resolve(options.repository),
    maxTurns,
  };
  const identity = createHash("sha256")
    .update(
      JSON.stringify({
        repository: settings.repository,
        agent: selected.name,
        model: selected.model,
        brief: options.brief,
        maxTurns,
        conversationHome: options.conversationHome,
        provider: options.sandboxProvider?.name,
      }),
    )
    .digest("hex");
  return task({
    key: options.key,
    ...(options.after ? { after: options.after } : {}),
    ...(options.timeoutMs !== undefined
      ? { timeoutMs: options.timeoutMs }
      : {}),
    interaction: { identity, actors: options.actors },
    perform: (context) => interactiveTurn(settings, context),
  });
}

async function interactiveTurn(
  options: InteractiveAgentTaskOptions &
    Required<Pick<InteractiveAgentTaskOptions, "maxTurns">>,
  context: TaskContext,
): Promise<InteractiveAgentResult> {
  const interaction = context.interaction;
  invariant(
    interaction,
    "Interactive tasks must run in a checkpointed workflow",
  );
  const previous = interactiveState(interaction.state);
  if (previous?.completed) return previous.completed;
  invariant(
    (previous?.turns ?? 0) < options.maxTurns,
    "Interactive task exceeded maxTurns",
  );
  if (previous?.conversation)
    invariant(interaction.answer, "A human answer is required to continue");
  const branch = `outpost/interactive-${createHash("sha256")
    .update(JSON.stringify([context.executionId, options.key]))
    .digest("hex")
    .slice(0, 24)}`;
  if (previous) {
    invariant(
      previous.branch === branch,
      "Interactive checkpoint branch mismatch",
    );
    await directory(previous.directory);
    const attached = (
      await git(previous.directory, ["symbolic-ref", "--short", "HEAD"])
    ).trim();
    invariant(
      attached === branch,
      "Interactive workspace branch changed; recover it explicitly",
    );
  }
  const { next, value } = await executeInteractiveTurn(
    options,
    context,
    branch,
    previous,
  );
  if (value.kind === "question") {
    if (next.turns >= options.maxTurns) {
      await interaction.save(next);
      throw new Error("Interactive task exceeded maxTurns before completion");
    }
    return interaction.suspend(value, next);
  }
  const completed: InteractiveAgentResult = {
    output: value.output,
    conversation: next.conversation,
    branch,
    directory: next.directory,
    turns: next.turns,
  };
  await interaction.save({ ...next, completed });
  return completed;
}
