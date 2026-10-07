import type { TokenUsage } from "./pricing.types.ts";
import type { Usage } from "./agent.types.ts";

export function addUsage(left: Usage, right: Usage): Usage {
  return {
    ...mergeModels(left, right, addUsage),
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
    ...mergeModels(next, previous, usageDifference),
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

function mergeModels(
  left: Usage,
  right: Usage,
  operation: (a: Usage, b: Usage) => Usage,
): Pick<Usage, "models"> {
  if (!left.models && !right.models) return {};
  const empty = { input: 0, cached: 0, output: 0 };
  const models = [
    ...new Set([
      ...Object.keys(left.models ?? {}),
      ...Object.keys(right.models ?? {}),
    ]),
  ].map((model) => {
    const before = left.models?.[model];
    const after = right.models?.[model];
    if (
      before &&
      after &&
      (before.inputIncludesCache !== false) !==
        (after.inputIncludesCache !== false)
    )
      throw new Error(
        "Cannot combine different cache conventions for one model; use distinct model aliases",
      );
    return [
      model,
      {
        ...operation(before ?? empty, after ?? empty),
        ...(before?.inputIncludesCache === false ||
        after?.inputIncludesCache === false
          ? { inputIncludesCache: false }
          : {}),
      },
    ];
  });
  return { models: Object.fromEntries(models) };
}

export function modelUsage(
  usage: Usage,
  model: string | undefined,
  inputIncludesCache = true,
): Usage {
  if (usage.models || !model) return usage;
  const { models: _, ...tokens } = usage;
  return {
    ...tokens,
    models: {
      [model]: {
        ...tokens,
        ...(inputIncludesCache ? {} : { inputIncludesCache: false }),
      },
    },
  };
}

export function validateUsage(value: unknown): asserts value is Usage {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Invalid reported usage");
  const usage = value as Record<string, unknown>;
  if (
    "inputIncludesCache" in usage &&
    typeof usage.inputIncludesCache !== "boolean"
  )
    throw new Error("Invalid cache accounting convention");
  if (
    usage.models !== undefined &&
    (!usage.models ||
      typeof usage.models !== "object" ||
      Array.isArray(usage.models))
  )
    throw new Error("Invalid model usage table");
  if (usage.complete !== undefined && typeof usage.complete !== "boolean")
    throw new Error("Reported usage complete must be a boolean");
  for (const value of [
    usage.input,
    usage.cached,
    usage.output,
    usage.cacheCreated ?? 0,
  ])
    if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0)
      throw new Error("Reported usage must contain nonnegative safe integers");
  const total: TokenUsage = Object.values(usage.models ?? {}).reduce(
    (sum, tokens) => {
      if (tokens && typeof tokens === "object" && "models" in tokens)
        throw new Error("Nested model usage is unsupported");
      validateUsage(tokens);
      return addUsage(sum, tokens);
    },
    { input: 0, cached: 0, output: 0 },
  );
  for (const dimension of [
    "input",
    "cached",
    "cacheCreated",
    "output",
  ] as const)
    if ((total[dimension] ?? 0) > Number(usage[dimension] ?? 0))
      throw new Error("Model usage exceeds total usage");
}
