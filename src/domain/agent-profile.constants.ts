export const AGENT_PROFILE_FIELDS: ReadonlySet<string> = new Set([
  "hooks",
  "instructions",
  "allowedTools",
  "mcpServers",
]);

export const AGENT_PROFILE_TOOLS: ReadonlySet<string> = new Set([
  "read",
  "edit",
  "shell",
]);

export const PROFILE_HARNESS_TOOLS = Object.freeze({
  read: Object.freeze(["read_file", "list_files", "search"]),
  edit: Object.freeze(["write_file", "edit_file"]),
  shell: Object.freeze(["shell"]),
});

export const AGENT_PROFILE_HOOK_FIELDS: ReadonlySet<string> = new Set([
  "claude",
  "codex",
  "copilot",
  "kimi",
  "antigravity",
  "outpost",
]);
