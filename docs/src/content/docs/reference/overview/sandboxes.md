---
title: "Sandboxes — Overview"
description: "A sandbox is the running environment attached to a workspace."
sidebar:
  label: Overview
  order: 0
---

A sandbox is the running environment attached to a workspace. It combines a provider lease with operations such as commands, file transfers and agent dispatch. Its lifetime determines which installed tools and environment state can be reused between operations.

## How it works

`createSandbox` returns a handle owned by its caller. Use that handle for sequential operations on the same environment, then close it explicitly or with `await using`. A sandbox accepts only one operation at a time; workflow concurrency does not make one handle safe for simultaneous operations.

## Boundaries and responsibilities

Workspace ownership and environment ownership are distinct. A sandbox closes the resources it owns, while a supplied workspace keeps its independent lifetime. Disposal does not imply that dirty Git work or independently persisted conversations have been deleted.

## Entry points

- [createSandbox](../../createsandbox/)
- [Sandbox](../../sandbox/)
- [SandboxOptions](../../sandboxoptions/)

[Learn with the practical guide](../../../guide/environment/lifecycle/).
