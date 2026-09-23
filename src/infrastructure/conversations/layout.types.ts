import type { SandboxLease } from "../../domain/sandbox.types.ts";

export interface ConversationLayout {
  readonly sidecars: boolean;
  searchRoot(home: string): string;
  remoteSearchRoot(home: string): string;
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
