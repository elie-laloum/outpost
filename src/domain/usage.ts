import type { Usage } from "./agent.types.ts";

export function addUsage(left: Usage, right: Usage): Usage {
  return {
    input: left.input + right.input,
    cached: left.cached + right.cached,
    output: left.output + right.output,
    ...(left.cacheCreated !== undefined || right.cacheCreated !== undefined
      ? { cacheCreated: (left.cacheCreated ?? 0) + (right.cacheCreated ?? 0) }
      : {}),
  };
}
