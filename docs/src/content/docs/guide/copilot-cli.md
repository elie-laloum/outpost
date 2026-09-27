---
title: "GitHub Copilot CLI"
description: "Use a Copilot account or token."
---

Use `copilotHarness()` to run the `copilot` CLI. This adapter uses Copilot account access; `authentication: "usage"` is unsupported.

## Supply a token

Use a fine-grained token with the Copilot Requests permission. Classic `ghp_` tokens are rejected.

```ts
import { agent, copilotHarness } from "@elie-laloum/outpost";

const coder = agent({
  harness: copilotHarness({
    authentication: { account: { variable: "COPILOT_GITHUB_TOKEN" } },
    variables: { COPILOT_GITHUB_TOKEN: process.env.COPILOT_GITHUB_TOKEN ?? "" },
  }),
});
```

## Use a stored login

Run `copilot login` on the host and select `authentication: "account"`. Outpost reads the last logged-in user’s token from `~/.copilot/config.json`, or under `COPILOT_HOME`. If the token is stored only in a system keychain, use the explicit variable form above.

## Session support

Native capture, warm and cold resume, and automatic response repairs are supported. Outpost resumes the exact session ID with `--resume`; it preserves history, metadata, plans, checkpoints and persistent files in a bounded session bundle. Automated fork is explicitly rejected: the interactive `/fork` command does not establish a supported headless fork contract. See [chat history](../chat-history/) and [GitHub’s session storage](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-best-practices).

See [GitHub’s CLI quickstart](https://docs.github.com/en/copilot/get-started/cli-quickstart) for Copilot access and login requirements.

API: [copilotHarness](../../reference/copilotharness/).
