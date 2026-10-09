import { appendFile } from "node:fs/promises";
import { join } from "node:path";
import type { ModelProvider } from "../../src/index.ts";
import type { RecipeComponentContext } from "../../src/recipes.ts";
import { createIssueTask } from "../../test-recipe-linear-development/linear-task.ts";

const fixtureRequest: typeof fetch = async (_url, init) => {
  const body = JSON.parse(String(init?.body));
  if (
    new Headers(init?.headers).get("Authorization") !==
    "fixture-only-linear-key"
  )
    return Response.json({}, { status: 401 });
  if (body.query.includes("OutpostViewer"))
    return Response.json({ data: { viewer: { id: "viewer" } } });
  if (body.variables.id === "ENG-404")
    return Response.json({
      errors: [{ extensions: { code: "ENTITY_NOT_FOUND" } }],
    });
  return Response.json({
    data: {
      issue: {
        id: "8ee1c81d-f4e4-4ce9-876a-c5747e7b1659",
        identifier: "ENG-123",
        title: "Check the greeting endpoint",
        description:
          "Keep the application runnable and cover the existing routes.",
        url: "https://linear.app/example/issue/ENG-123",
      },
    },
  });
};

export function createPromptedFixtureIssue(
  options: unknown,
  context: RecipeComponentContext,
) {
  return createIssueTask(options, context, {
    fetch: fixtureRequest,
    environment: () => undefined,
  });
}

export function createFixtureIssue(
  options: unknown,
  context: RecipeComponentContext,
) {
  return createIssueTask(options, context, {
    environment: () => "fixture-only-linear-key",
    fetch: fixtureRequest,
    async prompt() {
      throw new Error("Fixture must never request a real credential");
    },
  });
}

export function createFixtureModel(
  _options: unknown,
  context: RecipeComponentContext,
): ModelProvider {
  return {
    name: "linear-fixture",
    async request(request) {
      const prompt = JSON.stringify(request.messages);
      const phase = [
        {
          role: "planning",
          key: "plan",
          text: "Plan verified from the saved issue: inspect routes, preserve tests.",
        },
        {
          role: "implementation",
          key: "implementation",
          text: "Existing endpoints already satisfy the fixture issue.",
        },
        {
          role: "summary",
          key: "summary",
          text: "Verified the endpoints; npm test passed.",
        },
      ].find((phase) => prompt.includes(`You are the ${phase.role} agent.`));
      if (!phase) throw new Error("Unknown Linear fixture agent");
      await appendFile(
        join(context.directory, ".private/agent-calls"),
        phase.key + "\n",
      );
      const { text } = phase;
      return {
        text,
        content: [{ type: "text", text }],
        stopReason: "end",
        usage: { input: 3, cached: 0, output: 2 },
      };
    },
  };
}
