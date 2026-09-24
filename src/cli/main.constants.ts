export const cliOptions = {
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
  agent: { type: "string", description: "Agent: codex, claude or gemini" },
  provider: {
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
  file: { type: "string", description: "Container recipe path" },
  image: { type: "string", description: "Container image name" },
  uid: { type: "string", description: "Container user ID" },
  gid: { type: "string", description: "Container group ID" },
} as const;

export const commandOptions = {
  init: {
    description: "Create a standalone workflow project",
    options: [
      "yes",
      "agent",
      "provider",
      "manager",
      "model",
      "install",
      "build",
      "image",
      "directory",
      "repository",
    ],
  },
  doctor: {
    description: "Diagnose host and sandbox prerequisites",
    options: ["provider", "agent", "image", "json"],
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
    options: ["repository", "max-entries", "git", "locks", "resources", "json"],
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
    choices: ["codex", "claude", "gemini"],
  },
  {
    key: "provider",
    message: "Sandbox provider",
    choices: ["docker", "podman", "vercel", "daytona", "local"],
  },
] as const;
