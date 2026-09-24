import { artifactLabelMaxLength } from "./artifact.constants.ts";
import {
  artifactDigest,
  artifactId,
  validateArtifactReference,
} from "./artifact-reference.ts";
import { checkpointValue } from "./workflow/checkpoint-value.ts";
import type {
  ArtifactContract,
  ArtifactContractOptions,
  ArtifactReference,
  ArtifactStore,
  JsonArtifactOptions,
  PublishArtifactOptions,
  ReadArtifactOptions,
} from "./artifact.types.ts";

function identity(options: ArtifactContractOptions): ArtifactContractOptions {
  if (
    !options.name.trim() ||
    !options.version.trim() ||
    options.name.length > artifactLabelMaxLength ||
    options.version.length > artifactLabelMaxLength
  )
    throw new Error(
      `Artifact contract name and version must be nonempty and at most ${artifactLabelMaxLength} characters`,
    );
  return { name: options.name, version: options.version };
}

export const artifact = {
  json<T>(options: JsonArtifactOptions<T>): ArtifactContract<T> {
    const schema = options.schema;
    async function validate(value: unknown): Promise<T> {
      if (typeof schema === "function") return schema(value);
      const result = await schema["~standard"].validate(value);
      if (result.issues)
        throw new Error(
          `Artifact schema validation failed: ${JSON.stringify(result.issues)}`,
        );
      return result.value;
    }
    return Object.freeze({
      ...identity(options),
      encoding: "json",
      async encode(value: T) {
        const checked = checkpointValue(await validate(value));
        if (checked.kind !== "json")
          throw new Error("Artifact payload must be JSON");
        return Buffer.from(JSON.stringify(checked.value));
      },
      async decode(bytes: Uint8Array) {
        return validate(
          JSON.parse(
            new TextDecoder("utf-8", { fatal: true }).decode(bytes),
          ) as unknown,
        );
      },
    });
  },
  binary(options: ArtifactContractOptions): ArtifactContract<Uint8Array> {
    return Object.freeze({
      ...identity(options),
      encoding: "binary",
      async encode(value: Uint8Array) {
        if (!(value instanceof Uint8Array))
          throw new Error("Artifact payload must be Uint8Array");
        return Uint8Array.from(value);
      },
      async decode(bytes: Uint8Array) {
        return Uint8Array.from(bytes);
      },
    });
  },
};

export async function publishArtifact<T>(
  store: ArtifactStore,
  contract: ArtifactContract<T>,
  value: T,
  options: PublishArtifactOptions,
): Promise<ArtifactReference> {
  options.signal?.throwIfAborted();
  const producer = { ...options.producer };
  const parents = (options.parents ?? []).map(
    (parent) => validateArtifactReference(parent).id,
  );
  const bytes = Uint8Array.from(await contract.encode(value));
  options.signal?.throwIfAborted();
  const metadata = {
    format: 1 as const,
    digest: artifactDigest(bytes),
    size: bytes.length,
    contract: {
      name: contract.name,
      version: contract.version,
      encoding: contract.encoding,
    },
    producer,
    parents,
  };
  const reference = validateArtifactReference({
    ...metadata,
    id: artifactId(metadata),
  });
  await store.put(reference.id, bytes, options.signal);
  options.signal?.throwIfAborted();
  return reference;
}

export async function readStoredArtifact<T>(
  store: ArtifactStore,
  contract: ArtifactContract<T>,
  value: unknown,
  options: ReadArtifactOptions = {},
): Promise<T> {
  options.signal?.throwIfAborted();
  const reference = validateArtifactReference(value);
  if (
    reference.contract.name !== contract.name ||
    reference.contract.version !== contract.version ||
    reference.contract.encoding !== contract.encoding
  )
    throw new Error("Artifact contract mismatch");
  const producer = options.producer;
  if (
    producer &&
    (reference.producer.executionId !== producer.executionId ||
      reference.producer.taskKey !== producer.taskKey ||
      reference.producer.attempt !== producer.attempt)
  )
    throw new Error("Artifact producer mismatch");
  if (
    options.parents &&
    JSON.stringify(reference.parents) !==
      JSON.stringify(
        options.parents.map((parent) => validateArtifactReference(parent).id),
      )
  )
    throw new Error("Artifact lineage mismatch");
  const bytes = await store.get(reference.id, options.signal);
  options.signal?.throwIfAborted();
  if (
    bytes.length !== reference.size ||
    artifactDigest(bytes) !== reference.digest
  )
    throw new Error("Artifact content integrity mismatch");
  const result = await contract.decode(bytes);
  options.signal?.throwIfAborted();
  return result;
}
