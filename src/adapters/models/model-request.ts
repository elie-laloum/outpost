import { invariant, positive } from "../../domain/errors.ts";
import type { ModelRequest } from "../../domain/model.types.ts";
import { MODEL_REQUEST_FIELDS } from "./model.constants.ts";

export function validateModelRequest(request: ModelRequest): void {
  invariant(
    request !== null && typeof request === "object",
    "Model request must be an object",
  );
  invariant(
    Object.keys(request).every((key) => MODEL_REQUEST_FIELDS.has(key)),
    "Unsupported model request field; tools, streaming and conversations are not implemented",
  );
  invariant(
    typeof request.model === "string" && request.model.trim(),
    "Model name must be nonempty text",
  );
  invariant(
    typeof request.prompt === "string" && request.prompt.trim(),
    "Model prompt must be nonempty text",
  );
  invariant(
    request.system === undefined || typeof request.system === "string",
    "Model system instructions must be text",
  );
  if (request.maxOutputTokens !== undefined)
    positive(request.maxOutputTokens, "Model maxOutputTokens");
}
