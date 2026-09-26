export const cliOptions = {
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
    description: "Agent: codex, claude, antigravity, copilot or kimi",
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
    choices: ["codex", "claude", "antigravity", "copilot", "kimi"],
  },
  {
    key: "sandboxProvider",
    message: "Sandbox provider",
    choices: ["docker", "podman", "vercel", "daytona", "local"],
  },
] as const;

export const authenticationChoices = {
  codex: [
    {
      value: "account",
      label: "ChatGPT account (codex login, file storage)",
      instructions:
        'Run codex login on the host with cli_auth_credentials_store = "file". Isolated sandboxes receive a private copy of auth.json; the local provider uses the host login. This uses your ChatGPT plan.',
    },
    {
      value: "usage",
      label: "OpenAI API key (API billing)",
      variable: "OPENAI_API_KEY",
      instructions:
        "Set OPENAI_API_KEY in the workflow .env or parent environment. API usage is billed separately from subscriptions.",
    },
  ],
  claude: [
    {
      value: "account",
      label: "Claude subscription login (claude /login)",
      instructions:
        "Run claude and /login on the host. Isolated sandboxes receive only the subscription entry of .credentials.json. Logins stored in the macOS keychain are never read: choose account-token there.",
    },
    {
      value: "account-token",
      label: "Claude subscription token (claude setup-token)",
      variable: "CLAUDE_CODE_OAUTH_TOKEN",
      instructions:
        "Run claude setup-token on the host, then set CLAUDE_CODE_OAUTH_TOKEN in the workflow .env or parent environment. This uses your Claude subscription.",
    },
    {
      value: "usage",
      label: "Anthropic API key (API billing)",
      variable: "ANTHROPIC_API_KEY",
      instructions:
        "Set ANTHROPIC_API_KEY in the workflow .env or parent environment. API usage is billed separately from subscriptions.",
    },
  ],
  antigravity: [
    {
      value: "account",
      label: "Google account login (agy)",
      instructions:
        "Run agy on the host and sign in with your Google account. Isolated sandboxes receive a private copy of the Antigravity OAuth token.",
    },
    {
      value: "usage",
      label: "Gemini API key (API billing)",
      variable: "GEMINI_API_KEY",
      instructions:
        "Set GEMINI_API_KEY in the workflow .env or parent environment. Gemini API usage is billed separately from Google AI plans.",
    },
  ],
  copilot: [
    {
      value: "account",
      label: "GitHub Copilot login (copilot login)",
      instructions:
        "Run copilot login on the host. Outpost passes the token stored in ~/.copilot/config.json as COPILOT_GITHUB_TOKEN; tokens kept in the system keychain are never read: choose account-token there.",
    },
    {
      value: "account-token",
      label: "GitHub token with Copilot access (COPILOT_GITHUB_TOKEN)",
      variable: "COPILOT_GITHUB_TOKEN",
      instructions:
        "Set COPILOT_GITHUB_TOKEN to a fine-grained token with the Copilot Requests permission in the workflow .env or parent environment. Classic ghp_ tokens are rejected. Requests count against your Copilot plan.",
    },
  ],
  kimi: [
    {
      value: "account",
      label: "Kimi Code account login",
      instructions:
        "Sign in with the kimi CLI on the host. Isolated sandboxes receive a private copy of the ~/.kimi-code credentials and device identifier.",
    },
    {
      value: "usage",
      label: "Kimi API key (API billing, requires --model)",
      variable: "KIMI_API_KEY",
      instructions:
        "Set KIMI_API_KEY in the workflow .env or parent environment. API usage is billed separately from Kimi Code plans.",
    },
  ],
} as const;
