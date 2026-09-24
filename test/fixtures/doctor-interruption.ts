import assert from "node:assert/strict";
import { diagnoseImage } from "../../src/application/doctor-image.ts";
import { executeProcess } from "../../src/infrastructure/process.ts";

const provider = process.argv[2];
assert.ok(provider === "docker" || provider === "podman");
await diagnoseImage(
  { provider, agent: "codex", image: "outpost-ci:latest" },
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
