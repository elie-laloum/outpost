import { invariant } from "./errors.ts";
import type { HookCommand } from "./hook-command.types.ts";

export function hookCommand(command: HookCommand): HookCommand {
  invariant(
    command !== null && typeof command === "object",
    "Hook command must be an object",
  );
  invariant(
    Object.keys(command).every((key) =>
      ["executable", "arguments", "directory", "variables"].includes(key),
    ),
    "Unsupported hook command option",
  );
  invariant(
    typeof command.executable === "string" && command.executable.trim(),
    "Hook command requires an executable",
  );
  invariant(
    command.arguments === undefined ||
      (Array.isArray(command.arguments) &&
        command.arguments.every((value) => typeof value === "string")),
    "Hook command arguments must be strings",
  );
  invariant(
    command.directory === undefined ||
      (typeof command.directory === "string" && command.directory.trim()),
    "Hook command directory must be nonempty text",
  );
  invariant(
    command.variables === undefined ||
      (command.variables !== null &&
        typeof command.variables === "object" &&
        !Array.isArray(command.variables) &&
        Object.values(command.variables).every(
          (value) => typeof value === "string",
        )),
    "Hook command variables must be strings",
  );
  return Object.freeze({
    ...command,
    ...(command.arguments
      ? { arguments: Object.freeze([...command.arguments]) }
      : {}),
    ...(command.variables
      ? { variables: Object.freeze({ ...command.variables }) }
      : {}),
  });
}
