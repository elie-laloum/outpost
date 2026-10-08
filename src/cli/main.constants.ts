import { builtInAgentList, builtInAgents } from "../adapters/agents/catalog.ts";
export const cliOptions = {
  config: {
    type: "string",
    description: "TypeScript or JavaScript recipe bindings module",
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
  file: { type: "string", description: "YAML or container recipe path" },
  image: { type: "string", description: "Container image name" },
  uid: { type: "string", description: "Container user ID" },
  gid: { type: "string", description: "Container group ID" },
} as const;

export const commandOptions = {
  "recipe run": {
    description:
      "Run a local YAML recipe with explicit sandbox and agent bindings",
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
    options: ["sandboxProvider", "agent", "image", "json"],
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
    choices: builtInAgents.map((agent) => agent.name),
  },
  {
    key: "sandboxProvider",
    message: "Sandbox provider",
    choices: ["docker", "podman", "vercel", "daytona", "local"],
  },
] as const;
