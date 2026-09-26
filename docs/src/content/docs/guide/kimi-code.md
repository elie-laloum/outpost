---
title: "Kimi Code"
description: "Connect Kimi Code to an Outpost sandbox."
---

Use `kimiHarness()` with any supported [execution backend](../execution-backends/). Install the CLI in your image or allow bootstrap on remote providers.

## Account access

Sign in with the Kimi CLI on the host. Outpost uses the credentials and device identifier under `~/.kimi-code` (or `KIMI_CODE_HOME`). For a separate profile, `account.file` is the directory containing `credentials/kimi-code.json` and `device_id`.

## API access

Supply `KIMI_API_KEY` explicitly. API usage follows the provider’s API billing.

```ts
import { agent, kimiHarness } from "@elie-laloum/outpost";

const coder = agent({
  harness: kimiHarness({
    authentication: "usage",
    variables: { KIMI_API_KEY: process.env.KIMI_API_KEY ?? "" },
  }),
  model: process.env.KIMI_MODEL ?? "",
});
```

## Behavior

API authentication requires an explicit model on `agent()`. Set `KIMI_MODEL` in your application environment for the snippet above; this is an example variable, not an Outpost setting. Account authentication can use the CLI’s default model.

This adapter starts fresh sessions only. Native conversation capture, resume, fork and automatic response repair are unavailable.

API: [kimiHarness](../../reference/kimiharness/).
