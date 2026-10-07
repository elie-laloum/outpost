import { invariant } from "../../../domain/errors.ts";
import { quote } from "../../../infrastructure/process.ts";
import {
  CLAUDE_PROFILE_HOOK,
  CLAUDE_PROFILE_TOOLS,
} from "./claude-profile.constants.ts";
import type { ClaudeSettings } from "../settings.types.ts";

export function supportClaudeProfile(settings: ClaudeSettings): void {
  invariant(
    settings.profile?.allowedTools === undefined ||
      settings.permissions === undefined ||
      settings.permissions === "dontAsk",
    "Claude Code agent profile allowedTools requires permission mode dontAsk; remove conflicting permissions",
  );
}

export function claudeProfileArguments(
  settings: ClaudeSettings,
): readonly string[] {
  const profile = settings.profile;
  if (!profile) return [];
  const instructions =
    profile.instructions === undefined
      ? []
      : [
          "--append-system-prompt",
          profile.instructions,
          "--system-prompt-snapshot",
          "off",
        ];
  if (profile.allowedTools === undefined) return instructions;
  const tools = [
    ...new Set(
      profile.allowedTools.flatMap((tool) => {
        if (tool.startsWith("shell:")) return ["Bash"];
        if (tool === "read" || tool === "edit" || tool === "shell")
          return CLAUDE_PROFILE_TOOLS[tool];
        return [];
      }),
    ),
  ];
  const commands = profile.allowedTools
    .filter((tool) => tool.startsWith("shell:"))
    .map((tool) => tool.slice(6));
  const script = [
    `const tools = ${JSON.stringify(tools)};`,
    `const commands = ${JSON.stringify(commands)};`,
    `const shell = ${profile.allowedTools.includes("shell")};`,
    `const servers = ${JSON.stringify(Object.keys(settings.mcpServers ?? {}))};`,
    `const excluded = ${JSON.stringify(Object.entries(settings.mcpServers ?? {}).flatMap(([server, entry]) => (entry.tools?.exclude ?? []).map((tool) => `mcp__${server}__${tool}`)))};`,
    CLAUDE_PROFILE_HOOK,
  ].join("\n");
  return [
    ...instructions,
    `--tools=${tools.join(",")}`,
    "--permission-mode",
    "dontAsk",
    "--setting-sources",
    "",
    "--strict-mcp-config",
    "--settings",
    JSON.stringify({
      hooks: {
        PreToolUse: [
          {
            matcher: "*",
            hooks: [
              {
                type: "command",
                command: `node -e ${quote(script)} || exit 2`,
              },
            ],
          },
        ],
      },
    }),
  ];
}
