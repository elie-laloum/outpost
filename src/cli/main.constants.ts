export const help = `Outpost — sandboxed coding agents and workflows

outpost init [--yes] [--agent codex|claude] [--provider docker|podman|vercel|daytona|local]
             [--template blank|iterate|review|plan|plan-review] [--tracker github|beads|custom]
             [--manager npm|pnpm|yarn|bun] [--model NAME] [--install] [--build] [--image NAME] [--label NAME] [--directory PATH]
outpost image build|remove [--engine docker|podman] [--file PATH] [--image NAME] [--uid ID] [--gid ID]

Node.js 24+ and Git are required. Run generated scripts with Node.js.
`;

export const cliOptions = {
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
} as const;
