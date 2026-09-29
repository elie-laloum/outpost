---
title: "LocalProcessIdentity"
description: "LocalProcessIdentity — Outpost API"
sidebar:
  order: 20
---

## Parameters and properties

| Name        | Type     | Presence | Meaning                                                                                                                  |
| ----------- | -------- | -------- | ------------------------------------------------------------------------------------------------------------------------ |
| `host`      | `string` | Required | SHA-256 of the machine ID (/etc/machine-id); a different value means the owner ran on another host.                      |
| `boot`      | `string` | Required | Kernel boot ID; a different value means the PID comes from an earlier boot.                                              |
| `namespace` | `string` | Required | PID namespace of the process, such as pid:[4026531836]; a different namespace makes lock and activity ownership unknown. |
| `started`   | `string` | Required | Process start time in clock ticks since boot, read from /proc; a mismatch means the PID was reused.                      |

## Signature

```ts
export interface LocalProcessIdentity {
  readonly host: string;
  readonly boot: string;
  readonly namespace: string;
  readonly started: string;
}
```
