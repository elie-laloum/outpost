export interface Issue {
  readonly id: string;
  readonly title: string;
  readonly body?: string;
  readonly blockedBy?: readonly string[];
}

export interface Backlog {
  list(signal?: AbortSignal): Promise<readonly Issue[]>;
  get(id: string, signal?: AbortSignal): Promise<Issue>;
  close(id: string, signal?: AbortSignal): Promise<void>;
}

export interface Assignment {
  readonly id: string;
  readonly branch: string;
}
