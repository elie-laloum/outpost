import type { NativeConversationStore } from "../../../domain/conversation.types.ts";
import { createSessionBundleConversations } from "../../../infrastructure/conversations/session-bundle.ts";
import type { SessionBundleProfile } from "../../../infrastructure/conversations/session-bundle.types.ts";

export const copilotSessionProfile: SessionBundleProfile = {
  format: "copilot",
  root: { variable: "COPILOT_HOME", directory: ".copilot" },
  sessions: "session-state",
  include:
    /^(?:(?:events\.jsonl|workspace\.yaml|plan\.md)$|(?:checkpoints|files)(?:\/|$))/,
  required: ["events.jsonl", "workspace.yaml"],
  relocated: ["events.jsonl", "workspace.yaml"],
  relocate: (path, text, { cwd }) => {
    if (path === "workspace.yaml")
      return text.replace(
        /^(cwd|git_root):.*$/gm,
        (_, key) => `${key}: ${JSON.stringify(cwd)}`,
      );
    return text
      .split("\n")
      .map((line) => {
        if (!line.trim()) return line;
        const event = JSON.parse(line);
        if (event.type === "session.start" && event.data?.context) {
          event.data.context.cwd = cwd;
          if (event.data.context.gitRoot) event.data.context.gitRoot = cwd;
        }
        return JSON.stringify(event);
      })
      .join("\n");
  },
};

/** Creates the native store for GitHub Copilot CLI session directories. */
export function createCopilotConversations(): NativeConversationStore {
  return createSessionBundleConversations(copilotSessionProfile);
}
