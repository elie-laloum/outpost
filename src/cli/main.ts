#!/usr/bin/env node
import { parseArgs } from "node:util";
import { createInterface } from "node:readline/promises";
import { initialize, manageImage, type InitOptions } from "./scaffold.ts";

const help = `Outpost — sandboxed coding agents and workflows

outpost init [--yes] [--agent codex|claude] [--provider docker|podman|vercel|daytona|local]
             [--template blank|iterate|review|plan|plan-review] [--tracker github|beads|custom]
             [--manager npm|pnpm|yarn|bun] [--model NAME] [--install] [--build] [--image NAME] [--label NAME] [--directory PATH]
outpost image build|remove [--engine docker|podman] [--file PATH] [--image NAME] [--uid ID] [--gid ID]

Node.js 24+ and Git are required. Run generated scripts with Node.js.
`;

try {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      help: { type: "boolean", short: "h" },
      yes: { type: "boolean", short: "y" },
      install: { type: "boolean" },
      build: { type: "boolean" },
      agent: { type: "string" },
      provider: { type: "string" },
      template: { type: "string" },
      tracker: { type: "string" },
      manager: { type: "string" },
      model: { type: "string" },
      label: { type: "string" },
      directory: { type: "string" },
      engine: { type: "string" },
      file: { type: "string" },
      image: { type: "string" },
      uid: { type: "string" },
      gid: { type: "string" },
    },
  });
  if (values.help || !positionals.length) process.stdout.write(help);
  else if (positionals[0] === "init") {
    const options: Record<string, unknown> = Object.fromEntries(
      Object.entries(values).filter(([key]) => !["help", "yes"].includes(key)),
    );
    if (
      !values.yes &&
      !process.stdin.isTTY &&
      (!values.agent || !values.provider || !values.template || !values.tracker)
    )
      throw new Error(
        "Headless initialization requires --yes for defaults, or --agent, --provider, --template and --tracker.",
      );
    if (!values.yes && process.stdin.isTTY) {
      const terminal = createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      try {
        for (const [key, label, fallback] of [
          ["agent", "Agent (codex/claude)", "codex"],
          [
            "provider",
            "Sandbox (docker/podman/vercel/daytona/local)",
            "docker",
          ],
          [
            "template",
            "Template (blank/iterate/review/plan/plan-review)",
            "blank",
          ],
          ["tracker", "Issue tracker (github/beads/custom)", "github"],
        ] as const) {
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
      `Created ${result.files.length} files.\nRun: ${result.run}\n`,
    );
  } else if (
    positionals[0] === "image" &&
    ["build", "remove"].includes(positionals[1] ?? "")
  ) {
    const options = Object.fromEntries(
      Object.entries(values).filter(([key]) =>
        ["directory", "engine", "file", "image"].includes(key),
      ),
    );
    const image = await manageImage(positionals[1] as "build" | "remove", {
      ...options,
      ...(values.uid ? { uid: Number(values.uid) } : {}),
      ...(values.gid ? { gid: Number(values.gid) } : {}),
    });
    process.stdout.write(`${positionals[1]}: ${image}\n`);
  } else throw new Error("Unknown command. Run outpost --help.");
} catch (error) {
  process.stderr.write(
    `${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exitCode = 1;
}
