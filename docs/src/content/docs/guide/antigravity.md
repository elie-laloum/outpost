---
title: "Antigravity"
description: "Connect Antigravity to an Outpost sandbox."
---

Use `antigravityHarness()` with any supported [execution backend](../execution-backends/). Install the CLI in your image or allow bootstrap on remote providers.

## Account access

Run `agy` on the host and sign in. Outpost copies `~/.gemini/antigravity-cli/antigravity-oauth-token` into the private sandbox home. The executable is `agy`, not the former Gemini CLI.

## API access

Supply `GEMINI_API_KEY` explicitly. API usage follows the provider’s API billing.

```ts
import { agent, antigravityHarness } from "@elie-laloum/outpost";

const coder = agent({
  harness: antigravityHarness({
    authentication: "usage",
    variables: { GEMINI_API_KEY: process.env.GEMINI_API_KEY ?? "" },
  }),
});
```

## Behavior

Only fresh sessions are supported. Native capture, resume, fork and automatic response repair are unavailable. Use explicit workflow task outputs to pass findings to another request.

Generated images use the official Antigravity installer, which fetches the current CLI. For reproducible builds, provide an image containing the reviewed binary. See [Google’s CLI setup](https://antigravity.google/docs/getting-started?tab=cli).

API: [antigravityHarness](../../reference/antigravityharness/).
