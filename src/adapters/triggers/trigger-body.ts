import type { WorkflowJson } from "../../domain/workflow/checkpoint.types.ts";

export function textBody(body: Uint8Array): string {
  return Buffer.from(body).toString("utf8");
}

export function jsonBody(text: string): WorkflowJson {
  return JSON.parse(text);
}

export function formBody(body: Uint8Array): URLSearchParams {
  return new URLSearchParams(textBody(body));
}

export function toleranceMs(value: number | undefined, fallback: number) {
  const tolerance = value ?? fallback;
  if (!Number.isSafeInteger(tolerance) || tolerance <= 0)
    throw new Error("Webhook timestamp tolerance must be a positive integer");
  return tolerance;
}
