---
title: "Commands and terminal — Overview"
description: "Commands and interactive terminals give direct access to the execution environment."
sidebar:
  label: Overview
  order: 0
---

Commands and interactive terminals give direct access to the execution environment. A command runs a named executable with explicit arguments and returns its process outcome. A terminal connects a human to a native interactive agent session.

## How it works

Use `sandbox.command` for reproducible checks and automation. There is no implicit shell parsing: choose a shell explicitly when you need shell syntax. `attach` creates an interactive session and manages its owned resources; terminal support depends on the provider.

## Boundaries and responsibilities

Process completion and closed output streams are different events. Inspect exit status as well as output. Cancellation and deadlines target the operation; they must not silently turn a reusable sandbox into a disposed one. Interactive attachment does not return a validated typed agent response.

## Entry points

- [Command](../../command/)
- [CommandResult](../../commandresult/)
- [attach](../../attach/)
- [AttachOptions](../../attachoptions/)
- [AttachResult](../../attachresult/)
- [Channel](../../channel/)

[Learn with the practical guide](../../../guide/environment/commands/).
