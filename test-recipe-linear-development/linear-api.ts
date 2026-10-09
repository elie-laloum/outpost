import {
  linearEndpoint,
  linearLimits,
  viewerQuery,
  issueQuery,
} from "./linear.constants.ts";
import type { LinearFailureKind, LinearIssue } from "./linear.types.ts";

export class LinearFailure extends Error {
  readonly kind: LinearFailureKind;
  constructor(kind: LinearFailureKind, message: string) {
    super(message);
    this.kind = kind;
  }
}

export function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

async function payload(response: Response): Promise<unknown> {
  if (!response.body)
    throw new LinearFailure("protocol", "Linear returned an empty response");
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const item = await reader.read();
      if (item.done) break;
      length += item.value.byteLength;
      if (length > linearLimits.responseBytes)
        throw new LinearFailure(
          "protocol",
          "Linear response exceeded the size limit",
        );
      chunks.push(item.value);
    }
    try {
      return JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } catch {
      throw new LinearFailure("protocol", "Linear returned invalid JSON");
    }
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}

export function createLinearClient(token: string, request = fetch) {
  async function query(
    query: string,
    variables: Record<string, string>,
    signal: AbortSignal,
  ) {
    signal.throwIfAborted();
    try {
      const response = await request(linearEndpoint, {
        method: "POST",
        redirect: "error",
        headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify({ query, variables }),
        signal: AbortSignal.any([
          signal,
          AbortSignal.timeout(linearLimits.timeoutMs),
        ]),
      });
      if ([401, 403].includes(response.status)) {
        await response.body?.cancel();
        throw new LinearFailure(
          "authentication",
          "Linear rejected the API key",
        );
      }
      if (!response.ok) {
        await response.body?.cancel();
        throw new LinearFailure(
          "unavailable",
          "Linear is unavailable; the saved credential was kept",
        );
      }
      const value = await payload(response);
      if (!object(value))
        throw new LinearFailure("protocol", "Invalid Linear response");
      if (value.errors !== undefined && !Array.isArray(value.errors))
        throw new LinearFailure("protocol", "Invalid Linear error response");
      if (Array.isArray(value.errors) && value.errors.length) {
        const codes = value.errors.flatMap((error) =>
          object(error) && object(error.extensions)
            ? [error.extensions.code]
            : [],
        );
        if (
          codes.some((code) =>
            ["UNAUTHENTICATED", "AUTHENTICATION_ERROR", "FORBIDDEN"].includes(
              String(code),
            ),
          )
        )
          throw new LinearFailure(
            "authentication",
            "Linear rejected the API key",
          );
        if (codes.includes("ENTITY_NOT_FOUND"))
          throw new LinearFailure(
            "missing",
            "Linear issue not found or inaccessible",
          );
        throw new LinearFailure(
          "unavailable",
          "Linear refused the query; retry later or check API access",
        );
      }
      if (!object(value.data))
        throw new LinearFailure("protocol", "Missing Linear response data");
      return value.data;
    } catch (error) {
      signal.throwIfAborted();
      if (error instanceof LinearFailure) throw error;
      throw new LinearFailure(
        "unavailable",
        "Could not reach Linear; the saved credential was kept",
      );
    }
  }
  return {
    async validate(signal: AbortSignal) {
      const data = await query(viewerQuery, {}, signal);
      if (
        !object(data.viewer) ||
        typeof data.viewer.id !== "string" ||
        !data.viewer.id
      )
        throw new LinearFailure(
          "protocol",
          "Linear returned an invalid viewer",
        );
    },
    async issue(id: string, signal: AbortSignal): Promise<LinearIssue> {
      const data = await query(issueQuery, { id }, signal);
      if (data.issue === null)
        throw new LinearFailure(
          "missing",
          "Linear issue not found or inaccessible",
        );
      const item = data.issue;
      if (
        !object(item) ||
        typeof item.id !== "string" ||
        typeof item.identifier !== "string" ||
        typeof item.title !== "string" ||
        typeof item.url !== "string" ||
        (item.description !== null && typeof item.description !== "string")
      )
        throw new LinearFailure("protocol", "Linear returned an invalid issue");
      return {
        id: item.id,
        identifier: item.identifier,
        title: item.title,
        description: item.description ?? "",
        url: item.url,
      };
    },
  };
}
