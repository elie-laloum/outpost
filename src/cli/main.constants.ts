export const help = `Outpost — sandboxed coding agents and workflows

outpost init [--yes] [--agent codex|claude] [--provider docker|podman|vercel|daytona|local]
             [--manager npm|pnpm|yarn|bun] [--model NAME] [--install] [--build] [--image NAME] [--directory PATH] [--repository PATH]
outpost image build|remove [--engine docker|podman] [--file PATH] [--image NAME] [--uid ID] [--gid ID]

outpost doctor [--provider docker|podman|local|vercel|daytona] [--agent codex|claude] [--image NAME] [--json]

outpost recovery inspect [--repository PATH] [--max-entries NUMBER] [--git] [--locks] [--json]
outpost recovery verify --directory TRANSFER_PATH [--checksums] [--max-bytes NUMBER] [--restorability --repository PATH] [--json]
outpost recovery prune --policy FILE [--repository PATH] [--apply] [--json]

Node.js 24+ and Git are required. Run generated scripts with Node.js.
Initialization writes run.ts and project files directly into --directory (default: current directory).
--repository selects the target Git repository; relative paths are resolved from the workflow directory.
`;

export const cliOptions = {
  help: { type: "boolean", short: "h" },
  yes: { type: "boolean", short: "y" },
  install: { type: "boolean" },
  build: { type: "boolean" },
  json: { type: "boolean" },
  git: { type: "boolean" },
  locks: { type: "boolean" },
  restorability: { type: "boolean" },
  apply: { type: "boolean" },
  policy: { type: "string" },
  checksums: { type: "boolean" },
  "max-bytes": { type: "string" },
  "max-entries": { type: "string" },
  agent: { type: "string" },
  provider: { type: "string" },
  manager: { type: "string" },
  model: { type: "string" },
  directory: { type: "string" },
  repository: { type: "string" },
  engine: { type: "string" },
  file: { type: "string" },
  image: { type: "string" },
  uid: { type: "string" },
  gid: { type: "string" },
} as const;

export const initializationQuestions = [
  ["agent", "Agent (codex/claude)", "codex"],
  ["provider", "Sandbox (docker/podman/vercel/daytona/local)", "docker"],
] as const;
