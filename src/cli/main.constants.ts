import { builtInAgentList, builtInAgents } from "../adapters/agents/catalog.ts";
export const cliOptions = {
  interactive: {
    type: "boolean",
    description:
      "Answer recipe questions and review unsigned gates in the terminal (automatic on a TTY without --json)",
  },
  actor: {
    type: "string",
    description:
      "Trusted local actor submitting dialogue answers; defaults to the sole declared actor",
  },
  service: { type: "string", description: "Named service to start explicitly" },
  queue: { type: "string", description: "Named queue receiving a recipe job" },
  handler: {
    type: "string",
    description: "Trusted worker handler registered for the job",
  },
  "job-id": {
    type: "string",
    description:
      "Deterministic queue job ID; defaults to recipe:<handler>:<run-id>",
  },
  "idempotency-key": {
    type: "string",
    description: "Stable effect key retained when publishing a new job ID",
  },
  deadline: {
    type: "string",
    description: "Absolute queue deadline as epoch milliseconds",
  },
  "run-id": {
    type: "string",
    description: "Durable recipe execution identifier",
  },
  "retry-incomplete": {
    type: "boolean",
    description: "Explicitly authorize replay of interrupted tasks",
  },
  "workspace-recovery": {
    type: "string",
    description:
      "JSON file mapping shared or task names to inspected workspace recovery revisions and stopped-process authorization",
  },
  "recover-revision": {
    type: "string",
    description:
      "Explicitly recover a stopped checkpoint owner at this revision",
  },
  answer: {
    type: "string",
    description: "JSON file containing a WorkflowAnswer",
  },
  decision: {
    type: "string",
    description:
      "JSON file containing a WorkflowDecision, including any required proof",
  },
  catalog: {
    type: "string",
    description: "Local catalogue JSON or HTTPS catalogue URL",
  },
  recipe: {
    type: "string",
    description: "Recipe name in the selected catalogue",
  },
  input: {
    type: "strings",
    description: "Recipe input name=value; repeat for each parameter",
  },
  config: {
    type: "string",
    description:
      "Local YAML recipe configuration or TypeScript/JavaScript bindings module",
  },
  "base-url": {
    type: "string",
    description: "Custom Codex Responses API base URL (requires --model)",
  },
  "api-key-env": {
    type: "string",
    description: "Custom provider API-key environment variable",
  },
  authentication: {
    type: "string",
    description:
      "Authentication: account, account-token (Claude, Copilot) or usage",
  },
  help: { type: "boolean", short: "h", description: "Help" },
  yes: {
    type: "boolean",
    short: "y",
    description: "Accept defaults without prompting",
  },
  install: { type: "boolean", description: "Install project dependencies" },
  build: { type: "boolean", description: "Build the container image" },
  json: {
    type: "boolean",
    description: "Write a machine-readable JSON report",
  },
  git: { type: "boolean", description: "Inspect workspace Git state" },
  locks: { type: "boolean", description: "Inspect local lock ownership" },
  resources: {
    type: "boolean",
    description: "Inspect recorded sandbox activity",
  },
  restorability: {
    type: "boolean",
    description: "Check whether the retained transfer can be restored",
  },
  apply: { type: "boolean", description: "Apply changes (default: preview)" },
  policy: { type: "string", description: "Retention policy file" },
  checksums: { type: "boolean", description: "Verify retained file checksums" },
  "max-bytes": { type: "string", description: "Maximum bytes to inspect" },
  "max-entries": { type: "string", description: "Maximum inventory entries" },
  "runtime-directory": {
    type: "string",
    description: "Runtime control directory without repository discovery",
  },
  namespace: { type: "string", description: "Runtime namespace" },
  "workspace-id": { type: "string", description: "File workspace identity" },
  revision: {
    type: "string",
    description: "Inspected resource revision to recover explicitly",
  },
  "processes-stopped": {
    type: "boolean",
    description: "Confirm the workspace processes have been stopped",
  },
  "allocation-released": {
    type: "boolean",
    description:
      "Confirm an unknown sandbox allocation was released externally",
  },
  "adopt-files": {
    type: "boolean",
    description: "Explicitly adopt files from an interrupted attempt",
  },
  "adopt-source": {
    type: "boolean",
    description: "Explicitly adopt a changed mounted source",
  },
  "publication-id": { type: "string", description: "Publication identifier" },
  portable: {
    type: "boolean",
    description:
      "Explicitly restore a verified portable file snapshot into a new owned root",
  },
  "workspace-kind": {
    type: "string",
    description: "Workspace mode: git, directory or ephemeral",
  },
  agent: {
    type: "string",
    description: `Agent: ${builtInAgentList()}`,
  },
  sandboxProvider: {
    type: "string",
    description: "Provider: docker, podman, local, vercel or daytona",
  },
  manager: {
    type: "string",
    description: "Package manager: npm, pnpm, yarn or bun",
  },
  model: { type: "string", description: "Agent model name" },
  directory: {
    type: "string",
    description: "Workflow or retained transfer directory",
  },
  repository: { type: "string", description: "Target Git repository" },
  destination: { type: "string", description: "New restoration directory" },
  side: { type: "string", description: "Transfer side: previous or incoming" },
  engine: { type: "string", description: "Container engine: docker or podman" },
  file: { type: "string", description: "Recipe YAML path" },
  image: { type: "string", description: "Container image name" },
  uid: { type: "string", description: "Container user ID" },
  gid: { type: "string", description: "Container group ID" },
} as const;

export const commandOptions = {
  "recipe enqueue": {
    description: "Publish one recipe job without executing its workflow",
    options: [
      "file",
      "config",
      "queue",
      "handler",
      "run-id",
      "job-id",
      "idempotency-key",
      "deadline",
      "input",
      "json",
    ],
  },
  "recipe serve": {
    description: "Start only the selected local service until interrupted",
    options: ["file", "config", "service"],
  },
  "recipe list": {
    description: "List the bundled or selected recipe catalogue",
    options: ["catalog", "json"],
  },
  "recipe fetch": {
    description:
      "Download and validate a catalogue recipe without executing it",
    options: ["catalog", "recipe", "file", "json"],
  },
  "recipe init": {
    description:
      "Create a recipe starter with editor schema support; never overwrite an existing file",
    options: ["file", "config", "workspace-kind", "json"],
  },
  "recipe run": {
    description:
      "Run a local YAML recipe with explicit sandbox and agent bindings",
    options: [
      "file",
      "config",
      "input",
      "run-id",
      "interactive",
      "actor",
      "json",
    ],
  },
  "recipe status": {
    description: "Inspect a durable recipe without acquiring its checkpoint",
    options: ["file", "config", "run-id", "json"],
  },
  "recipe resume": {
    description: "Resume an existing durable recipe",
    options: [
      "file",
      "config",
      "run-id",
      "input",
      "retry-incomplete",
      "recover-revision",
      "workspace-recovery",
      "interactive",
      "actor",
      "json",
    ],
  },
  "recipe answer": {
    description: "Submit a persisted dialogue answer and resume its recipe",
    options: [
      "file",
      "config",
      "run-id",
      "answer",
      "interactive",
      "actor",
      "json",
    ],
  },
  "recipe decide": {
    description: "Submit a gate decision and resume its recipe",
    options: [
      "file",
      "config",
      "run-id",
      "decision",
      "interactive",
      "actor",
      "json",
    ],
  },
  "recipe validate": {
    description:
      "Validate a recipe and optional YAML configuration without allocating a sandbox",
    options: ["file", "config", "json"],
  },
  init: {
    description: "Create a standalone workflow project",
    options: [
      "yes",
      "agent",
      "sandboxProvider",
      "manager",
      "authentication",
      "model",
      "base-url",
      "api-key-env",
      "install",
      "build",
      "image",
      "directory",
      "repository",
    ],
  },
  doctor: {
    description: "Diagnose host and sandbox prerequisites",
    options: ["sandboxProvider", "agent", "image", "workspace-kind", "json"],
  },
  "image build": {
    description: "Build a container image",
    options: ["directory", "engine", "file", "image", "uid", "gid"],
  },
  "image remove": {
    description: "Remove a container image",
    options: ["directory", "engine", "image"],
  },
  "recovery inspect": {
    description: "Inspect recovery inventory",
    options: [
      "repository",
      "runtime-directory",
      "max-entries",
      "git",
      "locks",
      "resources",
      "json",
    ],
  },
  "recovery publication inspect": {
    description: "Inspect a workspace publication",
    options: [
      "runtime-directory",
      "namespace",
      "publication-id",
      "file",
      "config",
      "json",
    ],
  },
  "recovery publication finish": {
    description: "Finish an interrupted publication without replaying tasks",
    options: [
      "runtime-directory",
      "namespace",
      "publication-id",
      "processes-stopped",
      "file",
      "config",
      "run-id",
      "json",
    ],
  },
  "recovery publication rollback": {
    description: "Conditionally roll back a workspace publication",
    options: [
      "runtime-directory",
      "namespace",
      "publication-id",
      "processes-stopped",
      "file",
      "config",
      "run-id",
      "json",
    ],
  },
  "recovery workspace inspect": {
    description: "Inspect a file workspace record and snapshot",
    options: [
      "runtime-directory",
      "namespace",
      "workspace-id",
      "file",
      "config",
      "json",
    ],
  },
  "recovery registry inspect": {
    description: "Inspect local path registry coordination without Git",
    options: ["json"],
  },
  "recovery registry recover": {
    description:
      "Release an inspected registry gate after all coordinating processes are stopped",
    options: ["revision", "processes-stopped", "json"],
  },
  "recovery workspace recover": {
    description:
      "Recover stopped workspace ownership without replaying its workflow",
    options: [
      "runtime-directory",
      "namespace",
      "workspace-id",
      "revision",
      "processes-stopped",
      "allocation-released",
      "adopt-files",
      "adopt-source",
      "portable",
      "file",
      "config",
      "json",
    ],
  },
  "recovery verify": {
    description: "Verify a retained transfer",
    options: [
      "directory",
      "checksums",
      "max-bytes",
      "restorability",
      "repository",
      "json",
    ],
  },
  "recovery restore": {
    description: "Restore a retained transfer",
    options: [
      "directory",
      "repository",
      "destination",
      "side",
      "max-bytes",
      "apply",
      "json",
    ],
  },
  "recovery prune": {
    description: "Apply an explicit retention policy",
    options: ["policy", "repository", "apply", "json"],
  },
} as const;

export const initializationQuestions = [
  {
    key: "agent",
    message: "Coding agent",
    choices: builtInAgents.map((agent) => agent.name),
  },
  {
    key: "sandboxProvider",
    message: "Sandbox provider",
    choices: ["docker", "podman", "vercel", "daytona", "local"],
  },
] as const;
