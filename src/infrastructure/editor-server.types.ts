export interface EditorRequest {
  readonly method: string;
  readonly path: string;
  readonly query: URLSearchParams;
  /** Parsed JSON body; undefined for requests without one. */
  readonly body: unknown;
  /** Aborted when the client disconnects or the server closes. */
  readonly signal: AbortSignal;
}

export interface EditorEventStream {
  send(event: string, data: unknown): void;
}

export interface EditorEventsResponse {
  /** Streams server-sent events until the returned promise settles or the signal aborts. */
  readonly events: (
    stream: EditorEventStream,
    signal: AbortSignal,
  ) => Promise<void>;
}

export type EditorResponse =
  { readonly status?: number; readonly json: unknown } | EditorEventsResponse;

export type EditorRoute = (request: EditorRequest) => Promise<EditorResponse>;

export interface EditorServerOptions {
  /** Routes under `/api/`, keyed by `<METHOD> <path>`, such as `GET /api/project`. */
  readonly routes: Readonly<Record<string, EditorRoute>>;
  /** Bearer token every API request must present. */
  readonly token: string;
  /** Directory of the built web application; omitted to serve only the API. */
  readonly assets?: string;
  readonly port?: number;
  readonly maxBytes?: number;
}

export interface EditorServer {
  readonly url: string;
  readonly port: number;
  close(): Promise<void>;
}
