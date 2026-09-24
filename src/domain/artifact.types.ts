import type { StandardValidator } from "./response.types.ts";

export interface ArtifactIdentity {
  readonly name: string;
  readonly version: string;
  readonly encoding: "json" | "binary";
}

export interface ArtifactProducer {
  readonly executionId: string;
  readonly taskKey: string;
  readonly attempt: number;
}

export interface ArtifactReference {
  readonly format: 1;
  readonly id: string;
  readonly digest: string;
  readonly size: number;
  readonly contract: ArtifactIdentity;
  readonly producer: ArtifactProducer;
  readonly parents: readonly string[];
}

export interface ArtifactContract<T> extends ArtifactIdentity {
  encode(value: T): Promise<Uint8Array>;
  decode(bytes: Uint8Array): Promise<T>;
}

export type ArtifactContractOptions = Pick<
  ArtifactIdentity,
  "name" | "version"
>;
export type JsonArtifactOptions<T> = ArtifactContractOptions & {
  readonly schema: StandardValidator<T> | ((input: unknown) => T | Promise<T>);
};

export interface ArtifactStore {
  /** Publish atomically; reject conflicting bytes for an existing ID. */
  put(id: string, bytes: Uint8Array, signal?: AbortSignal): Promise<void>;
  /** Read bounded bytes or reject missing objects; callers verify integrity. */
  get(id: string, signal?: AbortSignal): Promise<Uint8Array>;
}

export interface PublishArtifactOptions {
  readonly producer: ArtifactProducer;
  readonly parents?: readonly ArtifactReference[];
  readonly signal?: AbortSignal;
}

export interface ReadArtifactOptions {
  readonly producer?: ArtifactProducer;
  readonly parents?: readonly ArtifactReference[];
  readonly signal?: AbortSignal;
}
