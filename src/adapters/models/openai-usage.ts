import type { Usage } from "../../domain/agent.types.ts";
import { object, requireResponse, tokens } from "./model-response.ts";

export function openaiUsage(
  value: unknown,
  input: string,
  output: string,
  details: string,
): Usage | undefined {
  if (value === undefined || value === null) return undefined;
  const data = object(value);
  const cached =
    data[details] == null
      ? 0
      : tokens(object(data[details]).cached_tokens ?? 0);
  const result = {
    input: tokens(data[input]),
    output: tokens(data[output]),
    cached,
  };
  requireResponse(cached <= result.input);
  return result;
}

export function toolArguments(input: unknown): string {
  return typeof input === "string" ? input : JSON.stringify(input);
}
