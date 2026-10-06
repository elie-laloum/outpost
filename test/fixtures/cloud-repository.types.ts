export interface VercelCommandRequest {
  readonly cmd: string;
  readonly args?: string[];
  readonly cwd?: string;
  readonly env?: Record<string, string>;
  readonly signal?: AbortSignal;
  readonly timeoutMs?: number;
}

export interface CloudFileEntry {
  readonly path: string;
  readonly content: Buffer;
}

export interface CloudFileRequest {
  readonly path: string;
}

export interface DaytonaSessionRequest {
  readonly command: string;
}
