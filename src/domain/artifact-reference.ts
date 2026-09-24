import {
  artifactDigestPattern,
  artifactLabelMaxLength,
} from "./artifact.constants.ts";
import { createHash } from "node:crypto";
import type { ArtifactReference } from "./artifact.types.ts";

export function artifactDigest(bytes: Uint8Array | string): string {
  return createHash("sha256").update(bytes).digest("hex");
}

export function artifactId(reference: Omit<ArtifactReference, "id">): string {
  return artifactDigest(
    JSON.stringify([
      reference.format,
      reference.digest,
      reference.size,
      reference.contract.name,
      reference.contract.version,
      reference.contract.encoding,
      reference.producer.executionId,
      reference.producer.taskKey,
      reference.producer.attempt,
      reference.parents,
    ]),
  );
}

export function validateArtifactReference(value: unknown): ArtifactReference {
  const invalid = () => new Error("Invalid artifact reference or lineage");
  if (
    !value ||
    typeof value !== "object" ||
    !("format" in value) ||
    value.format !== 1 ||
    !("id" in value) ||
    !digest(value.id) ||
    !("digest" in value) ||
    !digest(value.digest) ||
    !("size" in value) ||
    typeof value.size !== "number" ||
    !Number.isSafeInteger(value.size) ||
    value.size < 0 ||
    !("contract" in value) ||
    !value.contract ||
    typeof value.contract !== "object" ||
    !("producer" in value) ||
    !value.producer ||
    typeof value.producer !== "object" ||
    !("parents" in value) ||
    !Array.isArray(value.parents) ||
    !value.parents.every(digest) ||
    new Set(value.parents).size !== value.parents.length
  )
    throw invalid();
  const contract = value.contract,
    producer = value.producer;
  if (
    !("name" in contract) ||
    !label(contract.name) ||
    !("version" in contract) ||
    !label(contract.version) ||
    !("encoding" in contract) ||
    (contract.encoding !== "json" && contract.encoding !== "binary") ||
    !("executionId" in producer) ||
    !label(producer.executionId) ||
    !("taskKey" in producer) ||
    !label(producer.taskKey) ||
    !("attempt" in producer) ||
    typeof producer.attempt !== "number" ||
    !Number.isSafeInteger(producer.attempt) ||
    producer.attempt < 1
  )
    throw invalid();
  const reference: ArtifactReference = Object.freeze({
    format: 1,
    id: value.id,
    digest: value.digest,
    size: value.size,
    contract: Object.freeze({
      name: contract.name,
      version: contract.version,
      encoding: contract.encoding,
    }),
    producer: Object.freeze({
      executionId: producer.executionId,
      taskKey: producer.taskKey,
      attempt: producer.attempt,
    }),
    parents: Object.freeze([...value.parents]),
  });
  if (artifactId(reference) !== reference.id) throw invalid();
  return reference;
}

function digest(value: unknown): value is string {
  return typeof value === "string" && artifactDigestPattern.test(value);
}

function label(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.length <= artifactLabelMaxLength
  );
}
