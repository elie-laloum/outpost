import { resolve } from "node:path";
import { cancel, intro, isCancel, outro, select } from "@clack/prompts";
import { initializationQuestions } from "./main.constants.ts";
import type { CliInvocation } from "./main.types.ts";
import { initialize } from "./scaffold.ts";
import type { InitOptions } from "./scaffold.types.ts";

export async function initializeCommand({
  values,
}: CliInvocation): Promise<void> {
  const options: Record<string, unknown> = Object.fromEntries(
    Object.entries(values).filter(([key]) => !["help", "yes"].includes(key)),
  );
  if (
    !values.yes &&
    !process.stdin.isTTY &&
    (!values.agent || !values.provider)
  )
    throw new Error(
      "Headless initialization requires --yes for defaults, or --agent and --provider.",
    );
  if (!values.yes && process.stdin.isTTY) {
    intro("Create an Outpost workflow");
    for (const question of initializationQuestions) {
      if (options[question.key] !== undefined) continue;
      const value = await select({
        message: question.message,
        options: question.choices.map((value) => ({ value, label: value })),
      });
      if (isCancel(value)) {
        cancel("Initialization cancelled.");
        process.exitCode = 130;
        return;
      }
      options[question.key] = value;
    }
  }
  const result = await initialize(options as InitOptions);
  const message = `Initialized ${result.files.length} files in ${resolve(values.directory ?? process.cwd())}.\nRun: ${result.run}`;
  if (!values.yes && process.stdin.isTTY) outro(message);
  else process.stdout.write(`${message}\n`);
}
