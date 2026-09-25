---
title: "Agents — Overview"
description: "An agent is the coding tool that reads a task, reasons about the repository and executes actions."
sidebar:
  label: Overview
  order: 0
---

An agent is the coding tool that reads a task, reasons about the repository and executes actions. Outpost integrates Claude Code, Codex and Gemini CLI through adapters. An adapter translates Outpost requests into the native CLI protocol and translates its output into events and results.

## How it works

Keep the agent independent of its environment. `codex()`, `claude()` and `gemini()` configure what runs; a provider chooses where it runs. Creating an adapter neither allocates a sandbox nor logs in. Dispatch supplies the brief, supervises execution and collects the outcome.

## Boundaries and responsibilities

Adapters expose actual native capabilities rather than pretending every CLI behaves identically. Claude and Codex support native conversation persistence and continuation. Gemini currently supports fresh sessions without native capture, resume, fork or automatic response repairs. Credentials must be explicitly available in the execution environment.

## Entry points

- [claude](../../claude/)
- [codex](../../codex/)
- [gemini](../../gemini/)
- [AgentAdapter](../../agentadapter/)
- [AgentInput](../../agentinput/)
- [agentVersions](../../agentversions/)

[Learn with the practical guide](../../../guide/agents/adapters/).
