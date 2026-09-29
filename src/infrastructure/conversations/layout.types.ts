import type { SandboxLease } from "../../domain/sandbox.types.ts";

/** Where a CLI keeps one JSONL transcript per conversation, on the host and in a sandbox. */
export interface TranscriptConversationLayout {
  /** Persisted format name, used in transport keys and conversation records. */
  readonly format: string;
  /** Whether child transcripts live under `<directory>/<id>/subagents/`. */
  readonly sidecars: boolean;
  searchRoot(home: string): string;
  remoteSearchRoot(home: string): string;
  /** `find -name` pattern matching the transcript file in the sandbox. */
  pattern(id: string): string;
  matches(file: string, id: string): boolean;
  directory(repository: string, home: string): string;
  preferredPath?(id: string, repository: string, home: string): string;
  capturePath(
    id: string,
    repository: string,
    home: string,
    original: string,
  ): string;
  remotePath(id: string, lease: SandboxLease, original: string): string;
}
