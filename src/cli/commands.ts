import { Command, CommanderError, Option } from "commander";
import { recoveryCommand } from "./recovery-command.ts";
import { doctorCommand } from "./doctor-command.ts";
import { imageCommand } from "./image-command.ts";
import { initializeCommand } from "./init-command.ts";
import { cliOptions, commandOptions } from "./main.constants.ts";
import type { CliCommand, CliValues } from "./main.types.ts";

export async function runCli(
  args: readonly string[] = process.argv.slice(2),
): Promise<void> {
  const program = new Command()
    .name("outpost")
    .description("Outpost — sandboxed coding agents and workflows")
    .exitOverride()
    .configureOutput({ writeErr: () => {} });
  const handlers: Readonly<Record<string, CliCommand>> = {
    init: initializeCommand,
    doctor: doctorCommand,
    image: imageCommand,
    recovery: recoveryCommand,
  };
  for (const [name, definition] of Object.entries(commandOptions)) {
    const path = name.split(" ");
    let command = program;
    for (const part of path) {
      command =
        command.commands.find((item) => item.name() === part) ??
        command.command(part);
    }
    command.description(definition.description);
    for (const key of definition.options) {
      const configuration = cliOptions[key];
      const short = "short" in configuration ? `-${configuration.short}, ` : "";
      command.addOption(
        new Option(
          `${short}--${key}${configuration.type === "string" ? " <value>" : ""}`,
          configuration.description,
        ),
      );
    }
    if (name === "init")
      command.addOption(
        new Option(
          "--no-build",
          "Skip automatic container image build",
        ).default(undefined),
      );
    command.action(async () => {
      const values: Record<string, string | boolean> = {};
      const parsed = command.opts<Record<string, unknown>>();
      for (const option of command.options) {
        const value = parsed[option.attributeName()];
        if (typeof value === "string" || typeof value === "boolean")
          values[option.long!.replace(/^--(?:no-)?/, "")] = value;
      }
      await handlers[path[0]!]!({
        values: values as CliValues,
        positionals: path,
      });
    });
  }
  for (const command of program.commands.filter(
    (item) => item.commands.length,
  )) {
    command.allowExcessArguments().action(() => {
      throw new Error(`Unknown command. Run outpost ${command.name()} --help.`);
    });
  }
  try {
    await program.parseAsync(args.length ? [...args] : ["--help"], {
      from: "user",
    });
  } catch (error) {
    if (error instanceof CommanderError && error.exitCode === 0) return;
    throw error;
  }
}
