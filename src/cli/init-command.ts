import { resolve } from "node:path";
import { createInterface } from "node:readline/promises";
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
    const terminal = createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    try {
      for (const [key, label, fallback] of initializationQuestions) {
        options[key] ??=
          (await terminal.question(`${label} [${fallback}]: `)).trim() ||
          fallback;
      }
    } finally {
      terminal.close();
    }
  }
  const result = await initialize(options as InitOptions);
  process.stdout.write(
    `Initialized ${result.files.length} files in ${resolve(values.directory ?? process.cwd())}.\nRun: ${result.run}\n`,
  );
}
