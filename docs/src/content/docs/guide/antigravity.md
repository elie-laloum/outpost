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

Resume a conversation emitted in the same open sandbox with `sandbox.resume(id, options)` or a warm result’s `resume()`. Automatic response repairs use that same conversation. Antigravity has no verified portable capture format in Outpost: cold resume after sandbox disposal and automated fork are rejected, and `antigravityHarness()` refuses a `conversations` store. A new dispatch without continuation still starts a fresh session. See [chat history](../chat-history/) and [Google’s resume command](https://www.antigravity.google/docs/cli/commands/resume/).

## Pinned installation

Generated images and remote bootstrap install the version in [`agentVersions.antigravity`](../../reference/agentversions/) from versioned Google archives, verified against SHA-512 digests recorded in Outpost before extraction. Linux amd64/arm64 releases cover glibc and musl; the installer also recognizes macOS Intel/Apple Silicon. Unsupported platforms and checksum mismatches fail explicitly. Temporary files are cleaned after success, failure or a handled interruption.

Outpost sets `AGY_CLI_DISABLE_AUTO_UPDATE=true` in generated images, Antigravity requests and diagnostic commands, following [Google’s updater guidance](https://antigravity.google/docs/cli/troubleshooting/). This prevents background updates during these invocations.

Bootstrap reuses an existing executable without replacing or verifying its bytes. Run `outpost doctor --agent antigravity --sandbox-provider local` for the host, or add `--sandbox-provider docker --image your-image` to inspect an image. Doctor displays the installed and reference versions and warns when they differ; it does not verify the installed binary’s checksum. Existing images and recipes must be regenerated or updated and rebuilt to adopt this installation. These checks do not establish authenticated model compatibility.

API: [antigravityHarness](../../reference/antigravityharness/).
