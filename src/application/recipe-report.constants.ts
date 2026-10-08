export const recipeReportLimits = {
  characters: 16_384,
  causeDepth: 4,
} as const;
export const recipeOutputFields = [
  "status",
  "stdout",
  "stderr",
  "text",
  "conversation",
  "branch",
  "directory",
  "transcript",
] as const;
