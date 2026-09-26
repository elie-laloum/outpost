export const CONTEXT_DEFAULTS = {
  keepRecentResults: 4,
  truncatedCharacters: 2_000,
  triggerCharacters: 400_000,
  keepRecentMessages: 6,
} as const;

export const SUMMARY_INSTRUCTIONS =
  "Summarize this earlier part of an agent conversation for the agent that will continue it. Keep the task, decisions, files and commands involved, results, errors and open questions. Be factual and concise.";
