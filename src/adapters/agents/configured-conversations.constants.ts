export const conversationHomeProbe = {
  script: "JSON.stringify(process.env[process.argv[1]] || '')",
  retain: 16_384,
  deadlineMs: 10_000,
} as const;
