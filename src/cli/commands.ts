import { parseArgs } from "node:util";
import { recoveryCommand } from "./recovery-command.ts";
import { doctorCommand } from "./doctor-command.ts";
import { imageCommand } from "./image-command.ts";
import { initializeCommand } from "./init-command.ts";
import { cliOptions, help } from "./main.constants.ts";
import type { CliCommand } from "./main.types.ts";

export async function runCli(
  args: readonly string[] = process.argv.slice(2),
): Promise<void> {
  const invocation = parseArgs({
    args,
    allowPositionals: true,
    options: cliOptions,
  });
  if (invocation.values.help || !invocation.positionals.length) {
    process.stdout.write(help);
    return;
  }
  const commands: Readonly<Record<string, CliCommand>> = {
    doctor: doctorCommand,
    recovery: recoveryCommand,
    init: initializeCommand,
    image: imageCommand,
  };
  const name = invocation.positionals[0]!;
  if (!Object.hasOwn(commands, name))
    throw new Error("Unknown command. Run outpost --help.");
  await commands[name]!(invocation);
}
