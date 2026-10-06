import { invariant } from "./errors.ts";
import type { ResponseSpec } from "./response.types.ts";
import { snapshotResponseSchema } from "./response-schema.ts";

export function responseInstructions(response: ResponseSpec<unknown>): string {
  invariant(
    response.format === undefined ||
      response.format === "text" ||
      response.format === "json",
    "Unsupported response format",
  );
  const instructions = [
    "Final response format:",
    "If earlier instructions specify a conflicting response format, use this format instead. Keep following the task instructions.",
    `End your answer with exactly one <${response.tag}>...</${response.tag}> block. Do not write anything after the closing tag.`,
  ];
  if (response.format === "text")
    instructions.push("Put the requested text inside the response tag.");
  if (response.format === "json") {
    const schema = snapshotResponseSchema(response.jsonSchema);
    instructions.push(
      "Put valid JSON inside the response tag, without a Markdown code fence. The JSON must conform to this input schema:",
      JSON.stringify(schema, null, 2),
    );
  }
  return instructions.join("\n");
}
