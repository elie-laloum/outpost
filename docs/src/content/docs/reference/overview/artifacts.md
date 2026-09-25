---
title: "Typed artifacts — Overview"
description: "An artifact is a stored value published under an explicit typed contract."
sidebar:
  label: Overview
  order: 0
---

An artifact is a stored value published under an explicit typed contract. A reference travels through workflow results while the bytes live in an independently owned store. This separates data exchange from the lifetime of the sandbox that produced it.

## How it works

`artifact` defines the contract. Publishing validates and stores a value; reading checks the expected contract and content integrity. `artifactTask` and `readArtifact` connect those operations to declared task dependencies. Producer and parent references record lineage.

## Boundaries and responsibilities

Digests and lineage provide integrity and traceability, not producer authentication. The caller owns storage retention: keep objects while saved results still reference them. Closing a sandbox does not delete an independently managed artifact store.

## Entry points

- [artifact](../../artifact/)
- [publishArtifact](../../publishartifact/)
- [readStoredArtifact](../../readstoredartifact/)
- [artifactTask](../../artifacttask/)
- [readArtifact](../../readartifact/)
- [ArtifactStore](../../artifactstore/)

[Learn with the practical guide](../../../guide/advanced/artifacts/).
