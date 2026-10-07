export const CLAUDE_PROFILE_TOOLS = Object.freeze({
  read: Object.freeze(["Read", "Glob", "Grep"]),
  edit: Object.freeze(["Edit", "Write", "NotebookEdit"]),
  shell: Object.freeze(["Bash"]),
});

export const CLAUDE_PROFILE_HOOK = `let data = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => { data += chunk; });
process.stdin.on("end", () => {
  try {
    const input = JSON.parse(data);
    const name = input.tool_name;
    const permitted = tools.includes(name) &&
      (name !== "Bash" || shell || commands.includes(input.tool_input?.command));
    const mcp = servers.some((server) => typeof name === "string" && name.startsWith("mcp__" + server + "__"));
    if (excluded.includes(name) || (!permitted && !mcp)) throw new Error("Denied by agent profile allowedTools");
    process.stdout.write(JSON.stringify({ hookSpecificOutput: {
      hookEventName: "PreToolUse", permissionDecision: "allow"
    } }));
  } catch {
    process.stderr.write("Denied by agent profile allowedTools");
    process.exitCode = 2;
  }
});`;
