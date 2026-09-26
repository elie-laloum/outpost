import { CONTEXT_DEFAULTS } from "./context.constants.ts";
import type {
  HarnessContextInput,
  HarnessContextStrategy,
  HarnessContextStrategyOptions,
  SummarizeHistoryOptions,
  TruncateToolResultsOptions,
} from "./context.types.ts";
import { invariant, positive } from "./errors.ts";
import type { ModelMessage } from "./model.types.ts";

export function defineHarnessContextStrategy(
  options: HarnessContextStrategyOptions,
): HarnessContextStrategy {
  invariant(
    options !== null &&
      typeof options === "object" &&
      typeof options.name === "string" &&
      options.name.trim() &&
      typeof options.compact === "function",
    "Context strategies need a name and a compact function",
  );
  return Object.freeze({
    kind: "context",
    name: options.name,
    compact: async (input: HarnessContextInput) => options.compact(input),
  });
}

export function truncateToolResults(
  options: TruncateToolResultsOptions = {},
): HarnessContextStrategy {
  const keepRecent = positive(
    options.keepRecent ?? CONTEXT_DEFAULTS.keepRecentResults,
    "keepRecent",
  );
  const maxCharacters = positive(
    options.maxCharacters ?? CONTEXT_DEFAULTS.truncatedCharacters,
    "maxCharacters",
  );
  return defineHarnessContextStrategy({
    name: "truncate-tool-results",
    compact({ messages }) {
      const carriers = messages.flatMap((message, index) =>
        message.content.some((block) => block.type === "tool-result")
          ? [index]
          : [],
      );
      const older = new Set(carriers.slice(0, -keepRecent));
      let changed = false;
      const compacted = messages.map((message, index): ModelMessage => {
        if (!older.has(index)) return message;
        return {
          ...message,
          content: message.content.map((block) => {
            if (
              block.type !== "tool-result" ||
              block.content.length <= maxCharacters
            )
              return block;
            changed = true;
            return {
              ...block,
              content: `${block.content.slice(0, maxCharacters)}\n[earlier output truncated from ${block.content.length} characters]`,
            };
          }),
        };
      });
      return changed ? compacted : undefined;
    },
  });
}

export function summarizeHistory(
  options: SummarizeHistoryOptions = {},
): HarnessContextStrategy {
  const trigger = positive(
    options.triggerCharacters ?? CONTEXT_DEFAULTS.triggerCharacters,
    "triggerCharacters",
  );
  const keep = positive(
    options.keepRecentMessages ?? CONTEXT_DEFAULTS.keepRecentMessages,
    "keepRecentMessages",
  );
  return defineHarnessContextStrategy({
    name: "summarize-history",
    async compact({ messages, summarize }) {
      if (JSON.stringify(messages).length <= trigger) return undefined;
      const cut = boundary(messages, Math.max(2, messages.length - keep));
      if (cut === undefined) return undefined;
      const summary = await summarize(messages.slice(1, cut));
      return [
        messages[0]!,
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Summary of the earlier conversation:\n${summary}`,
            },
          ],
        },
        ...messages.slice(cut),
      ];
    },
  });
}

function boundary(
  messages: readonly ModelMessage[],
  from: number,
): number | undefined {
  for (let index = Math.min(from, messages.length - 1); index > 1; index--)
    if (messages[index]!.role === "assistant") return index;
  return undefined;
}
