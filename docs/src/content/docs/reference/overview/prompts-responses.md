---
title: "Prompts and responses — Overview"
description: "Prompts describe the work an agent should perform; response contracts describe the data your program accepts from its answer."
sidebar:
  label: Overview
  order: 0
---

Prompts describe the work an agent should perform; response contracts describe the data your program accepts from its answer. Keeping these responsibilities separate lets a task remain readable while downstream code receives a validated value.

## How it works

A brief can provide literal text or a file with declared substitutions. `response.text` extracts tagged text; `response.json` parses and validates tagged JSON. Validation narrows unknown model output before your program relies on it. Supported adapters can request a bounded number of repair attempts.

## Boundaries and responsibilities

A valid answer is not evidence that its claims are true or its proposed code passes tests. Keep factual checks and execution gates explicit. Template command expansion also has its own trust boundary: values inserted into an existing shell command must be trusted or quoted by the prompt author.

## Entry points

- [Brief](../../brief/)
- [PromptVariables](../../promptvariables/)
- [response](../../response/)
- [ResponseSpec](../../responsespec/)
- [StandardValidator](../../standardvalidator/)
- [ResponseError](../../responseerror/)

[Learn with the practical guide](../../../guide/agents/responses/).
