import type { TransportReference } from "../domain/transport.types.ts";
export interface ArchiveChunk {
  readonly reference: TransportReference;
  readonly sha256: string;
  readonly size: number;
}
export interface ArchiveFile {
  readonly path: string;
  readonly kind: "file" | "symlink";
  readonly mode: number;
  readonly size: number;
  readonly chunks: readonly ArchiveChunk[];
}
export interface ArchiveManifest {
  readonly format: 1;
  readonly files: readonly ArchiveFile[];
}
