---
title: "Remote transfers — Overview"
description: "Remote transfers move repository data and explicit files between the host and an execution environment."
sidebar:
  label: Overview
  order: 0
---

Remote transfers move repository data and explicit files between the host and an execution environment. Their contracts describe bytes, paths and manifests so synchronization can reason about what moved, rather than treating a remote sandbox as a shared local directory.

## How it works

`FileTransfers` exposes transfer capabilities; `FileManifestEntry` describes entries used for comparison and verification. Providers can support incremental payload reuse and bounded batches. Repository synchronization combines these capabilities with Git history and host-state checks.

## Boundaries and responsibilities

Preserve binary content and supported filesystem semantics. A digest checks integrity, not who supplied the data. Incoming changes must not overwrite concurrent host edits silently; conflicts and interrupted synchronization can retain recovery data for inspection.

## Entry points

- [FileTransfers](../../filetransfers/)
- [FileManifestEntry](../../filemanifestentry/)

[Learn with the practical guide](../../../guide/operations/remote-transfers/).
