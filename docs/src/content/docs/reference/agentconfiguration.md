---
title: "AgentConfiguration"
description: "AgentConfiguration — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { AgentConfiguration } from "@elie-laloum/outpost";
```

## Parameters and properties

| Name    | Type                                        | Presence | Meaning                                                                                                                                                                            |
| ------- | ------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `files` | `readonly ConfigurationFile[]`              | Required | JSON files to merge into the agent home. An empty list only validates the variables.                                                                                               |
| `host`  | `readonly HostConfiguration[] \| undefined` | Optional | Host files read with the credential file safeguards, filtered by select and merged into the agent home. They are skipped on the local provider, where the CLI reads the host home. |

## Signature

```ts
export interface AgentConfiguration {
  readonly files: readonly ConfigurationFile[];
  readonly host?: readonly HostConfiguration[];
}
```

## Related contracts

- [ConfigurationFile](../configurationfile/)
- [HostConfiguration](../hostconfiguration/)
