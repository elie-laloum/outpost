import { containerProvider } from "../../src/providers/container.ts";
import { executeProcess } from "../../src/infrastructure/process.ts";
import { OutpostError } from "../../src/domain/errors.ts";

const root = process.argv[2]!;
const lease = await containerProvider(
  process.env.OUTPOST_CONTAINER_ENGINE === "podman" ? "podman" : "docker",
  {
    image: process.env.OUTPOST_CONTAINER_IMAGE ?? "outpost-ci:latest",
    networks: "none",
  },
  async (command) => {
    const args = command.arguments ?? [];
    if (args[0] === "create")
      process.stdout.write(`container=${args[args.indexOf("--name") + 1]}\n`);
    return executeProcess(command);
  },
).acquire({
  repository: root,
  directory: root,
  gitDirectories: [],
  variables: {},
});
try {
  const result = await lease.invoke({
    executable: "sh",
    arguments: ["-c", "echo ready; sleep 30"],
    observe(channel, text) {
      if (channel === "stdout") process.stdout.write(text);
    },
  });
  process.stdout.write(`completed=${result.status}\n`);
} catch (error) {
  if (!(error instanceof OutpostError)) throw error;
  process.stdout.write(`fault=${error.code}\n`);
}
