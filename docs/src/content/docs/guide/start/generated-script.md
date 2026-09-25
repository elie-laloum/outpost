---
title: "Understand the generated script"
description: "Read the CLI output as a small program you own."
---

The CLI creates an ordinary TypeScript program. You can read and change it; no workflow service runs in the background.

| Part                   | Why it exists                                                                                        |
| ---------------------- | ---------------------------------------------------------------------------------------------------- |
| `repository`           | Resolves the target Git checkout relative to the script, independent of the current shell directory. |
| `.env` and `variables` | Read explicitly declared credentials and pass them to the execution environment.                     |
| `authentication`       | Initialize the selected login in the private sandbox home.                                           |
| `agent`                | Select Codex, Claude or Gemini behavior.                                                             |
| `provider`             | Choose where that agent runs, independently of its protocol.                                         |
| `brief`                | Read the task file and substitute the objective.                                                     |
| `dispatch`             | Own one execution and collect its answer, changes, usage and conversation.                           |

The generated starter integrates commits into the target branch. The next [complete dispatch example](../../agents/dispatch/) shows a named branch so you can review before integrating; that page includes its own preparation and runnable code.

## Three different lifetimes

A **workspace** owns Git state. A **sandbox** owns the execution environment attached to it. A **conversation** owns agent context and can outlive that environment. Closing one does not mean the others have disappeared.

A **workflow** connects tasks and their typed results. It can run ordinary TypeScript functions, commands or agent jobs. It does not remove workspace ownership rules.

## Adapt the starter

Change the brief first. Then choose a [branch policy](../../environment/branches/), add a [response contract](../../agents/responses/), or keep a [sandbox warm](../../environment/lifecycle/). The [configuration reference](../../manual/configuration/) explains path and environment precedence.
