import { createSandbox, type RecipeBindings } from "@elie-laloum/outpost";
import {
  createMemorySandboxProvider,
  scriptedAgent,
} from "@elie-laloum/outpost/testing";

export default async function bindings(
  signal: AbortSignal,
): Promise<RecipeBindings> {
  const repository = process.env.OUTPOST_RECIPE_REPOSITORY;
  if (!repository)
    throw new Error("Set OUTPOST_RECIPE_REPOSITORY to a test checkout");
  return {
    sandbox: await createSandbox({
      repository,
      signal,
      logging: false,
      sandboxProvider: createMemorySandboxProvider({
        commands: [
          { executable: "npm", arguments: ["test"], stdout: "Tests passed\n" },
        ],
      }),
    }),
    agents: {
      coder: scriptedAgent({
        turns: [
          { status: 7, stderr: "Simulated transient failure\n" },
          {
            text: "Done",
            usage: { input: 10, output: 5, cached: 0 },
            commit: {
              message: "fix: parser",
              files: { "src/p.ts": "export const parse = () => true;\n" },
            },
          },
        ],
      }),
    },
  };
}
