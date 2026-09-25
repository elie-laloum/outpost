import type { ArtifactStore } from "../domain/artifact.types.ts";
import { artifactDigestPattern } from "../domain/artifact.constants.ts";
import type { ArtifactStoreOptions } from "./transport-artifact-store.types.ts";
import { immutableObject } from "./transport-json.ts";
import { artifactMaxBytes } from "./artifact-store.constants.ts";
import { readLimit } from "./transport-envelope.ts";

export function artifactStore(options: ArtifactStoreOptions): ArtifactStore {
  const maxBytes = readLimit(options.maxBytes ?? artifactMaxBytes);
  if (!maxBytes) throw new Error("Artifact maxBytes must be positive");
  const key = (id: string) => {
    if (!artifactDigestPattern.test(id))
      throw new Error("Invalid artifact storage ID");
    return `artifacts/${id}.blob`;
  };
  return {
    async put(id, input, signal) {
      if (input.byteLength > maxBytes)
        throw new Error("Artifact exceeds maxBytes");
      await immutableObject(
        options.transporter,
        key(id),
        Buffer.from(input),
        signal,
      );
    },
    async get(id, signal) {
      const value = await options.transporter.read(key(id), {
        maxBytes,
        ...(signal ? { signal } : {}),
      });
      if (!value) throw new Error("Artifact does not exist");
      return value.bytes;
    },
  };
}
