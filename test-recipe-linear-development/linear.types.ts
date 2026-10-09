export interface LinearIssue {
  readonly id: string;
  readonly identifier: string;
  readonly title: string;
  readonly description: string;
  readonly url: string;
}

export type LinearFailureKind =
  "authentication" | "missing" | "unavailable" | "protocol";

export interface LinearDependencies {
  readonly fetch?: typeof fetch;
  readonly environment?: () => string | undefined;
  readonly prompt?: (signal: AbortSignal) => Promise<string | undefined>;
  readonly write?: (message: string) => void;
}
