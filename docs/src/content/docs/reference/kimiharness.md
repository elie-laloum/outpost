---
title: "kimiHarness"
description: "kimiHarness — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { kimiHarness } from "@elie-laloum/outpost";
```

## Purpose and behavior

Create a Kimi Code harness from execution, authentication and permission settings without starting the CLI. Compose it with agent({ harness, model }) to select a model name independently; reasoning and maxOutputTokens are rejected. Native session bundles support capture, warm/cold resume and response repairs. Fork runs the native kimi fork command and continues a distinct child ID. The CLI owns its internal model/tool loop. Account profiles default to region: "global" for kimi.ai; set mainland-cn explicitly for kimi.com. The region determines the credential slot and sandbox login endpoints.

[Complete example and detailed rules](../../guide/agents/harness/).

## Parameters and properties

| Name                      | Type                                            | Presence | Meaning                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ------------------------- | ----------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `settings`                | `KimiSettings \| undefined`                     | Optional | Configuration for the Kimi Code harness; pass the selected model to agent() instead.                                                                                                                                                                                                                                                                                                                                                                                               |
| `settings.region`         | `"mainland-cn" \| "global" \| undefined`        | Optional | Account deployment: "global" for kimi.ai (default) or "mainland-cn" for kimi.com. Selects the matching OAuth file, account endpoints and sandbox login region without copying the host configuration. Requires account authentication when authentication is supplied; usage forms reject an explicit region. Omission selects global for accounts and does not change API authentication. Conflicting declared account endpoints are rejected, including with the default region. |
| `settings.authentication` | `AgentAuthentication \| undefined`              | Optional | Account authentication reads the OAuth file for the selected region and device_id from ~/.kimi-code or KIMI_CODE_HOME; account.file selects a dedicated profile directory. Usage forms accept KIMI_API_KEY or an explicit key/variable and require a model on agent(). Account key/variable forms are unsupported. Omission prepares no credentials.                                                                                                                               |
| `settings.variables`      | `Readonly<Record<string, string>> \| undefined` | Optional | Explicit environment declarations; values are strings.                                                                                                                                                                                                                                                                                                                                                                                                                             |

## Returns

`CliHarness`

## Signature

```ts
export declare function kimiHarness(settings?: KimiSettings): CliHarness;
```

## Related contracts

- [CliHarness](../cliharness/)
- [KimiSettings](../kimisettings/)
