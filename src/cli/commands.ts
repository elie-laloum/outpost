import { Command, CommanderError, Option } from "commander";
import { recoveryCommand } from "./recovery-command.ts";
import { doctorCommand } from "./doctor-command.ts";
import { imageCommand } from "./image-command.ts";
import { recipeCommand } from "./recipe-command.ts";
import {
  cliOptions,
  commandGroups,
  commandOptions,
  optionAliases,
  subcommandGroups,
} from "./main.constants.ts";
import { packageVersion } from "./package-version.ts";
import type {
  CliCommand,
  CliOptionConfiguration,
  CliValues,
  CommandDefinition,
} from "./main.types.ts";

const handlers: Readonly<Record<keyof typeof commandGroups, CliCommand>> = {
  doctor: doctorCommand,
  image: imageCommand,
  recipe: recipeCommand,
  recovery: recoveryCommand,
};

function find(parent: Command, part: string, hidden = false): Command {
  return (
    parent.commands.find((item) => item.name() === part) ??
    parent.command(part, { hidden })
  );
}

function locate(
  program: Command,
  path: readonly string[],
  hidden = false,
): Command {
  let command = program;
  for (const [index, part] of path.entries())
    command = find(command, part, hidden && index === path.length - 1);
  return command;
}

function addOptions(
  command: Command,
  definition: CommandDefinition,
  renames: Readonly<Record<string, string>>,
): void {
  for (const key of definition.options) {
    const configuration: CliOptionConfiguration = cliOptions[key];
    const option = new Option(
      `--${key}${configuration.type !== "boolean" ? " <value>" : ""}`,
      key === "file" && command.parent?.name() === "image"
        ? "Container recipe filename inside --directory"
        : configuration.description,
    );
    if (configuration.type === "strings")
      option.argParser((value: string, previous: string[] = []) => [
        ...previous,
        value,
      ]);
    command.addOption(option);
    if (configuration.type === "boolean" && key === "interactive")
      command.addOption(
        new Option(
          "--no-interactive",
          "Leave dialogue questions pending without prompting",
        ).default(undefined),
      );
  }
  for (const [legacy, current] of Object.entries(renames))
    if ((definition.options as readonly string[]).includes(current))
      command.addOption(new Option(`--${legacy} <value>`).hideHelp());
}

function collect(
  command: Command,
  renames: Readonly<Record<string, string>>,
): CliValues {
  const values: Record<string, string | boolean | string[]> = {};
  const parsed = command.opts<Record<string, unknown>>();
  for (const option of command.options) {
    const value = parsed[option.attributeName()];
    if (
      typeof value !== "string" &&
      typeof value !== "boolean" &&
      !(Array.isArray(value) && value.every((item) => typeof item === "string"))
    )
      continue;
    const name = option.long!.replace(/^--(?:no-)?/, "");
    const current = renames[name];
    if (current) {
      if (name in optionAliases)
        process.stderr.write(
          `Warning: --${name} is deprecated; use --${current}.\n`,
        );
      values[current] = value;
      continue;
    }
    values[name] = value;
  }
  return values as CliValues;
}

function canonical(command: Command): string {
  const names: string[] = [];
  for (let item: Command | null = command; item?.parent; item = item.parent)
    names.unshift(item.name());
  return names.join(" ");
}

function register(
  program: Command,
  name: string,
  definition: CommandDefinition,
  path: readonly string[],
  legacy?: string,
): void {
  const command = locate(program, (legacy ?? name).split(" "), !!legacy);
  const renames: Record<string, string> = {
    ...optionAliases,
    ...(legacy ? { directory: "path" } : {}),
  };
  command.description(definition.description);
  addOptions(command, definition, renames);
  if ("examples" in definition)
    command.addHelpText(
      "after",
      `\nExamples:\n${definition.examples.map((line) => `  $ ${line}`).join("\n")}\n`,
    );
  command.action(async () => {
    const values = collect(command, renames);
    if (legacy)
      process.stderr.write(
        `Warning: outpost ${legacy} is deprecated; use outpost ${name}.\n`,
      );
    await handlers[path[0] as keyof typeof handlers]({
      values,
      positionals: path,
    });
  });
}

export async function runCli(
  args: readonly string[] = process.argv.slice(2),
): Promise<void> {
  const program = new Command()
    .name("outpost")
    .description(
      "Outpost — run coding agents in sandboxes and compose their workflows.\nStart with `outpost doctor`, then `outpost image list` to choose an agent image.",
    )
    .version(packageVersion(), "-v, --version", "Print the Outpost version")
    .helpOption("-h, --help", "Show help for a command")
    .exitOverride()
    .showSuggestionAfterError()
    .configureOutput({ writeErr: () => {} });
  program.addHelpCommand(false);
  for (const [name, group] of Object.entries(commandGroups))
    find(program, name).helpGroup(group.heading).description(group.description);
  for (const [name, description] of Object.entries(subcommandGroups))
    locate(program, name.split(" ")).description(description);
  for (const [name, definition] of Object.entries(commandOptions)) {
    const path = name.split(" ");
    register(program, name, definition, path);
    for (const legacy of "aliases" in definition ? definition.aliases : [])
      register(program, name, definition, path, legacy);
  }
  for (const command of program.commands)
    for (const group of [command, ...command.commands])
      if (group.commands.length)
        group.allowExcessArguments().action(() => {
          throw new Error(
            `Unknown command. Run outpost ${canonical(group)} --help.`,
          );
        });
  program.addHelpText(
    "after",
    "\nDocumentation: https://elie-laloum.github.io/outpost/guide/cli/\n",
  );
  try {
    await program.parseAsync(args.length ? [...args] : ["--help"], {
      from: "user",
    });
  } catch (error) {
    if (error instanceof CommanderError && error.exitCode === 0) return;
    throw error;
  }
}
