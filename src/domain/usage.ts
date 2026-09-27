import type { Usage } from "./agent.types.ts";

export function addUsage(left: Usage, right: Usage): Usage {
  return {
    input: left.input + right.input,
    cached: left.cached + right.cached,
    output: left.output + right.output,
    ...(left.complete === false || right.complete === false
      ? { complete: false }
      : {}),
    ...(left.cacheCreated !== undefined || right.cacheCreated !== undefined
      ? { cacheCreated: (left.cacheCreated ?? 0) + (right.cacheCreated ?? 0) }
      : {}),
  };
}

export function usageDifference(next: Usage, previous: Usage): Usage {
  return {
    input: Math.max(0, next.input - previous.input),
    cached: Math.max(0, next.cached - previous.cached),
    output: Math.max(0, next.output - previous.output),
    ...(next.cacheCreated !== undefined || previous.cacheCreated !== undefined
      ? {
          cacheCreated: Math.max(
            0,
            (next.cacheCreated ?? 0) - (previous.cacheCreated ?? 0),
          ),
        }
      : {}),
    ...(next.complete === false ? { complete: false } : {}),
  };
}
