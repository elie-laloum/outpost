import { createEventParser } from "./events.ts";
import type { EditorFailure } from "./types.ts";

const tokenKey = "outpost-editor-token";
let token: string | undefined;

/** Reads the session token from the URL fragment once, then keeps it out of the address bar. */
function sessionToken(): string {
  if (token) return token;
  const fromHash = new URLSearchParams(location.hash.slice(1)).get("token");
  if (fromHash) {
    token = fromHash;
    try {
      sessionStorage.setItem(tokenKey, fromHash);
    } catch {
      /* Storage can be unavailable; the token stays in memory. */
    }
    history.replaceState(
      history.state,
      "",
      location.pathname + location.search,
    );
    return fromHash;
  }
  try {
    token = sessionStorage.getItem(tokenKey) ?? "";
  } catch {
    token = "";
  }
  return token;
}

export class ApiError extends Error {
  readonly failure: EditorFailure;
  constructor(failure: EditorFailure) {
    super(failure.message);
    this.failure = failure;
  }
}

function headers(body: boolean): Record<string, string> {
  return {
    authorization: `Bearer ${sessionToken()}`,
    ...(body ? { "content-type": "application/json" } : {}),
  };
}

async function failure(response: Response): Promise<ApiError> {
  const body = (await response.json().catch(() => ({}))) as {
    error?: Omit<EditorFailure, "status">;
  };
  const message =
    response.status === 401
      ? "This editor session is no longer authorized. Open the URL printed by outpost recipe editor."
      : (body.error?.message ??
        `Request failed with status ${response.status}`);
  return new ApiError({ ...body.error, status: response.status, message });
}

export async function api<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(path, {
    method: body === undefined ? "GET" : "POST",
    headers: headers(body !== undefined),
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  if (!response.ok) throw await failure(response);
  return (await response.json()) as T;
}

/** Streams editor events until the server closes the stream or the signal aborts. */
export async function streamEvents(
  receive: (event: string, data: unknown) => void,
  signal: AbortSignal,
): Promise<void> {
  const response = await fetch("/api/events", {
    headers: headers(false),
    signal,
  });
  if (!response.ok || !response.body) throw await failure(response);
  const parse = createEventParser((event, data) =>
    receive(event, JSON.parse(data)),
  );
  const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
  for (;;) {
    const { value, done } = await reader.read();
    if (done) return;
    parse(value);
  }
}
