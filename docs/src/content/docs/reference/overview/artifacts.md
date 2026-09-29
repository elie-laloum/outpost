---
title: "Typed artifacts — Overview"
description: "Publish a typed, versioned value to a store once and pass a small reference that every read verifies."
sidebar:
  label: Overview
  order: 0
---

## Choose a contract

A contract has a `name` and a `version`, each nonempty and at most 1024 characters. A read needs the same name, version and encoding as the reference.

|            | `defineJsonArtifact()`                                 | `defineBinaryArtifact()`             |
| ---------- | ------------------------------------------------------ | ------------------------------------ |
| Value      | Lossless JSON, typed by `schema`                       | `Uint8Array`                         |
| On publish | Validates with `schema`, then serializes the result    | Copies the bytes                     |
| On read    | Parses strict UTF-8 JSON, then validates with `schema` | Copies the bytes                     |
| Rejects    | Schema failures, `undefined`, `NaN`, class instances   | Any value that is not a `Uint8Array` |
| `encoding` | `json`                                                 | `binary`                             |

## What publish and read check

`publishArtifact()` stores the encoded bytes under an `id` derived from their SHA-256 digest, size, contract, producer and parents. Each failure below rejects with a plain `Error` carrying the message shown.

| Step                                  | Check                                          | Failure                                                       |
| ------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------- |
| Publish: encode                       | Contract accepts the value                     | Schema or payload error; nothing is stored                    |
| Publish: store                        | Store `maxBytes`, 16 MiB by default            | `Artifact exceeds maxBytes`                                   |
| Publish: same `id` already stored     | Identical bytes                                | Different bytes: `Existing object content integrity mismatch` |
| Read: reference                       | Shape, digests and recomputed `id`             | `Invalid artifact reference or lineage`                       |
| Read: contract                        | Same name, version and encoding                | `Artifact contract mismatch`                                  |
| Read: expected `producer` / `parents` | Exact match, parents in order                  | `Artifact producer mismatch` / `Artifact lineage mismatch`    |
| Read: bytes                           | Same size and SHA-256 digest                   | `Artifact content integrity mismatch`                         |
| `readArtifact()`                      | Produced by this execution and that dependency | `Artifact dependency producer mismatch`                       |

:::caution
Digests and lineage prove integrity, not authorship. Anyone who can write to the store can publish any `producer`.
:::

## Entry points

Guide: [Artifacts](../../../guide/artifacts/) · [Tasks and dependencies](../../../guide/task-dependencies/) · [Security](../../../guide/security/)

- [defineJsonArtifact](../../definejsonartifact/)
- [defineBinaryArtifact](../../definebinaryartifact/)
- [publishArtifact](../../publishartifact/)
- [readStoredArtifact](../../readstoredartifact/)
- [defineArtifactTask](../../defineartifacttask/)
- [readArtifact](../../readartifact/)
- [ArtifactContract](../../artifactcontract/)
- [ArtifactReference](../../artifactreference/)
- [ArtifactStore](../../artifactstore/)
- [PublishArtifactOptions](../../publishartifactoptions/)
- [ReadArtifactOptions](../../readartifactoptions/)
