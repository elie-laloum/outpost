import type { ConversationFormat } from "../conversations.types.ts";
import { claudeLayout } from "./claude-layout.ts";
import { codexLayout } from "./codex-layout.ts";
import type { ConversationLayout } from "./layout.types.ts";

export function conversationLayout(
  format: ConversationFormat,
): ConversationLayout {
  const factories = { claude: claudeLayout, codex: codexLayout };
  return factories[format]();
}
