import assert from "node:assert/strict";
import { doctorCommand } from "../../src/cli/doctor-command.ts";
import { executeProcess } from "../../src/infrastructure/process.ts";

const sandboxProvider = process.argv[2];
assert.ok(sandboxProvider === "docker" || sandboxProvider === "podman");
await doctorCommand(
  {
    positionals: ["doctor"],
    values: {
      sandboxProvider,
      agent: "codex",
      image: "outpost-ci:latest",
      json: true,
    },
  },
  async (command) => {
    const args = command.arguments ?? [];
    if (args[0] === "create")
      process.stdout.write(`container=${args[args.indexOf("--name") + 1]}\n`);
    const inner = args.indexOf("outpost");
    if (inner >= 0 && args[inner + 1] === "codex")
      return executeProcess({
        ...command,
        arguments: [
          ...args.slice(0, inner + 1),
          "node",
          "-e",
          "console.log('ready'); setTimeout(() => {}, 30000)",
        ],
        observe(channel, text) {
          if (channel === "stdout") process.stdout.write(text);
        },
      });
    return executeProcess(command);
  },
);
