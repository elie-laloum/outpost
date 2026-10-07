export const AGENT_PROFILE_FIELDS: ReadonlySet<string> = new Set([
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
