import { join } from "node:path";
import type { TaskContext } from "@elie-laloum/outpost";
import type { RecipeComponentContext } from "@elie-laloum/outpost/recipes";
import { validatedLinearToken } from "./credentials.ts";
import { createLinearClient, LinearFailure, object } from "./linear-api.ts";
import { prepareDemoRepository } from "./project.ts";
import type { LinearDependencies } from "./linear.types.ts";

function identifier(value: string): string | undefined {
  const text = value.trim();
  if (/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(text)) return text;
  if (/^[A-Z][A-Z0-9]*-\d+$/i.test(text)) return text.toUpperCase();
  try {
    const url = new URL(text);
    if (url.protocol === "https:" && url.hostname === "linear.app")
      return /\/issue\/([A-Z][A-Z0-9]*-\d+)(?:\/|$)/i
        .exec(url.pathname)?.[1]
        ?.toUpperCase();
  } catch {}
  return undefined;
}

export async function createIssueTask(
  _options: unknown,
  context: RecipeComponentContext,
  dependencies: LinearDependencies = {},
) {
  const token = await validatedLinearToken(
    join(context.directory, ".private/linear-token"),
    context.signal,
    dependencies,
  );
  await prepareDemoRepository(context.directory, context.signal);
  const client = createLinearClient(token, dependencies.fetch);
  return async (_input: unknown, task: TaskContext) => {
    const dialogue = task.interaction;
    if (!dialogue)
      throw new Error("The Linear issue task requires a durable interaction");
    const ask = (question: string) =>
      dialogue.suspend({ question }, { phase: "issue" });
    if (!dialogue.answer) ask("Linear issue identifier, UUID, URL or number?");
    const answer = dialogue.answer!.value.trim();
    const state = dialogue.state;
    let id: string | undefined;
    if (
      object(state) &&
      state.phase === "team" &&
      typeof state.number === "string"
    )
      id = identifier(`${answer}-${state.number}`);
    else {
      if (/^\d+$/.test(answer))
        dialogue.suspend(
          { question: `Team key for issue ${answer} (for example ENG)?` },
          { phase: "team", number: answer },
        );
      id = identifier(answer);
    }
    if (!id)
      return ask(
        "Invalid identifier. Enter TEAM-123, a UUID, a Linear issue URL or a number.",
      );
    try {
      const issue = await client.issue(id, task.signal);
      (
        dependencies.write ??
        ((text) => {
          process.stderr.write(text);
        })
      )(`[Linear] ${issue.identifier}: ${issue.title}\n`);
      return issue;
    } catch (error) {
      if (error instanceof LinearFailure && error.kind === "missing")
        return ask(
          "Issue not found or inaccessible. Enter another issue identifier.",
        );
      throw error;
    }
  };
}
