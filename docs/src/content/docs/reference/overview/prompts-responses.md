---
title: "Prompts and responses — Overview"
description: "A brief tells the agent what to do; a response contract turns its tagged answer into a validated value."
sidebar:
  label: Overview
  order: 0
---

## Brief forms

A text brief is sent as written. A file brief is a template that Outpost reads and expands before each pass.

| Form        | Written as                   | What Outpost does                                                                                         | Failure                                                            |
| ----------- | ---------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Text brief  | `{ text }`                   | Sends the text unchanged                                                                                  | `values` given: code `configuration`                               |
| File brief  | `{ file, values }`           | Reads the file, resolved from the process working directory                                               | Unreadable file rejects the dispatch                               |
| Placeholder | `{{NAME}}` in the file       | Replaces it with `values.NAME` or the reserved `WORK_BRANCH` / `BASE_BRANCH`                              | Missing value: code `prompt`; unused value: `warn` callback        |
| Command     | `` !`command` `` in the file | Runs it in the sandbox with `sh -c`, all commands in parallel, and inserts its stdout, trailing space cut | Nonzero exit: code `prompt`; past `expansionMs` (30000): `timeout` |

:::caution
Placeholders inside a command are filled without quoting. Pass only trusted `values` there.
:::

## Text or JSON response

Both contracts read the last complete `<tag>…</tag>` pair of the final turn and return the result as `value`.

|                    | `defineTextResponse()`      | `defineJsonResponse()`                                               |
| ------------------ | --------------------------- | -------------------------------------------------------------------- |
| `value`            | Trimmed text inside the tag | Output of `schema`, typed from it                                    |
| Content accepted   | Any text                    | JSON, optionally wrapped in a Markdown code fence                    |
| `ResponseError` if | No complete tag             | No complete tag, invalid JSON, schema issues or a thrown parse error |

- **Before the sandbox starts**: the brief must contain `<tag>`, and `repairs` above 0 needs an agent that can resume; otherwise code `configuration`. `passes` must be 1.
- **Invalid answer**: each repair turn resumes the same conversation with the validation error and asks only for the corrected tag.
- **No repair left**: `dispatch()` throws `ResponseError` with code `response`; `raw` holds the rejected content and `recovery` names the conversation, branch, directory and turns.

## Entry points

Guide: [Typed responses](../../../guide/typed-responses/) · [Write a brief](../../../guide/briefs/)

- [defineTextResponse](../../definetextresponse/)
- [defineJsonResponse](../../definejsonresponse/)
- [Brief](../../brief/)
- [PromptVariables](../../promptvariables/)
- [ResponseSpec](../../responsespec/)
- [StandardValidator](../../standardvalidator/)
- [ResponseError](../../responseerror/)
