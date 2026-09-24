import { invariant } from "../domain/errors.ts";
import { resolve } from "node:path";
import {
  cancel,
  intro,
  isCancel,
  outro,
  select,
  spinner,
} from "@clack/prompts";
import { projectSettings } from "./project-settings.ts";
import { authenticationInstructions } from "./init-authentication.ts";
import { supportedManagers } from "./scaffold.constants.ts";
import {
  initializationQuestions,
  authenticationChoices,
} from "./main.constants.ts";
import type { CliInvocation } from "./main.types.ts";
import { initialize } from "./scaffold.ts";
import type { InitOptions } from "./scaffold.types.ts";

export async function initializeCommand({
  values,
}: CliInvocation): Promise<void> {
  const options: Record<string, unknown> = Object.fromEntries(
    Object.entries(values).filter(([key]) => !["help", "yes"].includes(key)),
  );
  if (values["base-url"] !== undefined) options.baseUrl = values["base-url"];
  if (values["api-key-env"] !== undefined)
    options.apiKeyEnvironment = values["api-key-env"];
  delete options["base-url"];
  delete options["api-key-env"];
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
    const settings = await projectSettings(
      resolve(values.directory ?? process.cwd()),
      options as InitOptions,
    );
    const choices = Object.entries(authenticationChoices).find(
      ([name]) => name === options.agent,
    )?.[1];
    invariant(choices, "Choose codex, claude or gemini");
    const questions = [
      {
        key: "manager",
        message: "Package manager",
        options: supportedManagers.map((value) => ({ value, label: value })),
        initialValue: settings.manager,
      },
      {
        key: "authentication",
        message: "Agent authentication",
        options: [...choices],
        initialValue: "api-key",
      },
    ];
    for (const question of questions) {
      if (options[question.key] !== undefined) continue;
      const value = await select(question);
      if (isCancel(value)) {
        cancel("Initialization cancelled.");
        process.exitCode = 130;
        return;
      }
      options[question.key] = value;
    }
  }
  options.build ??= ["docker", "podman"].includes(
    String(options.provider ?? "docker"),
  );
  const progress = !values.yes && process.stdin.isTTY ? spinner() : undefined;
  progress?.start(
    options.build
      ? "Creating project and building its container image"
      : "Creating project",
  );
  let result;
  try {
    result = await initialize(options as InitOptions);
  } catch (error) {
    progress?.stop("Initialization failed");
    throw error;
  }
  progress?.stop("Project ready");
  const installation = options.install
    ? ""
    : "Install project dependencies with your selected package manager before running.\n";
  const message = `Initialized ${result.files.length} files in ${resolve(values.directory ?? process.cwd())}.\n${authenticationInstructions(options as InitOptions)}\n${installation}Run: ${result.run}`;
  if (!values.yes && process.stdin.isTTY) outro(message);
  else process.stdout.write(`${message}\n`);
}
