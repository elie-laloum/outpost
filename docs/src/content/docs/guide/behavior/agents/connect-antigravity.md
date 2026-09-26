---
title: "Connect Antigravity CLI"
description: "Install agy, choose Google account or Gemini API key authentication, and run fresh Antigravity sessions."
sidebar:
  order: 5.1
---

`agent({ harness: antigravityHarness() })` runs Google's Antigravity CLI, `agy`, through the same sandbox providers as the other adapters. Antigravity is Google's successor to Gemini CLI for agentic command-line work; Outpost no longer ships a Gemini CLI adapter. Every run starts a fresh session.

## Install agy

Outpost installs `agy` with Google's official installer script, `https://antigravity.google/cli/install.sh`, where it installs the other CLIs:

- **Generated container images.** The recipe written by `outpost init` runs the installer at build time with a temporary `HOME`, then installs the binary as `/usr/local/bin/agy`. The installer places `agy` in `~/.local/bin`, but Outpost mounts an empty private home over `/home/agent` at run time, which would hide a binary left in the image user's home. The [prebuilt agent image](../../../environment/providers/agent-images/) recipe keeps the same step. A custom image must likewise provide `agy` on `PATH` outside the home; see the [official installation instructions](https://antigravity.google/docs/cli/install/).
- **Remote providers.** With bootstrap enabled, the default, a remote sandbox without `agy` on `PATH` runs `curl -fsSL https://antigravity.google/cli/install.sh | bash` when the agent is prepared, which installs `~/.local/bin/agy` in the sandbox home. This requires `curl`, `bash` and network access to `antigravity.google` in the sandbox. `bootstrap: false` disables this; the environment must then already provide `agy`. The pinned Claude Code, Codex, Copilot and Kimi CLIs are installed with npm into `~/.outpost-tools` instead.
- **Local execution.** With `localSandboxProvider()`, install `agy` on the host by following the [official installation instructions](https://antigravity.google/docs/cli/install/). This provider runs directly on the host without isolation.

Antigravity has no pinned version: `agentVersions` has no `antigravity` entry, and the installer fetches the current release (1.2.11 when this integration was tested). Rebuilding an image or bootstrapping a new remote sandbox can therefore pick up a newer `agy`. The installer is a remote shell script downloaded during the build or bootstrap; when your policy requires a reviewed binary, install `agy` in your own image and disable remote bootstrap. Outpost sets `AGY_CLI_DISABLE_AUTO_UPDATE=true` for every `agy` command so that the CLI does not replace itself during a run. A value in the harness `variables` overrides it.

## Authenticate

Select authentication explicitly with the harness `authentication` option. Without it, Outpost prepares nothing and `agy` uses whatever the sandbox environment already provides. Antigravity accepts `account`, `account.file`, `usage`, `usage.key` and `usage.variable`. See the [authentication manual](../../../manual/authentication/) for the forms shared by all agents.

### Google account

```ts
import {
  agent as composeAgent,
  antigravityHarness,
} from "@elie-laloum/outpost";

const google = composeAgent({
  harness: antigravityHarness({ authentication: "account" }),
});
const dedicated = composeAgent({
  harness: antigravityHarness({
    authentication: {
      account: { file: "~/.outpost/accounts/antigravity-oauth-token" },
    },
  }),
});
console.log(google.name, dedicated.name);
```

Run `agy` on the host and sign in with your Google account. `account` reads `~/.gemini/antigravity-cli/antigravity-oauth-token`; `account.file` reads another file of the same format. On Docker, Podman, Vercel, Daytona and Firecracker, Outpost reads that host file and writes it to `~/.gemini/antigravity-cli/antigravity-oauth-token` in the private sandbox home with mode `0600`. Outpost reads only regular files of at most 1 MiB; symbolic links and directories are refused. When the file is missing, the error names the path, asks you to run `agy` on the host, and suggests `usage` with `GEMINI_API_KEY`. File contents never appear in errors.

`agy` keeps its OAuth login in the system keyring when a D-Bus session is available and writes the token file only otherwise. Outpost never reads a system keychain, so a keyring-only login cannot be copied: sign in again where no keyring is available, or use a Gemini API key. Upstream issue [google-antigravity/antigravity-cli#479](https://github.com/google-antigravity/antigravity-cli/issues/479) reports that a file-stored login may not be read back by a fresh `agy` process; this has not been verified live with `agy` 1.2.x, so check a small request before relying on account authentication.

With `localSandboxProvider()`, Outpost copies and writes nothing on the host: `agy` uses its own host login for `account` and `account.file`.

### Gemini API key

```ts
import {
  agent as composeAgent,
  antigravityHarness,
} from "@elie-laloum/outpost";

const declared = composeAgent({
  harness: antigravityHarness({ authentication: "usage" }),
});
const team = composeAgent({
  harness: antigravityHarness({
    authentication: { usage: { variable: "TEAM_GEMINI_API_KEY" } },
  }),
});
console.log(declared.name, team.name);
```

`usage` reads `GEMINI_API_KEY` from the resolved workflow variables: the harness `variables`, the sandbox provider `variables` and the declarations in the repository `.outpost/.env`. `usage.variable` reads another declared variable, and `usage.key` takes a literal key, which should stay out of committed code. A missing variable fails when the sandbox is prepared with `Missing GEMINI_API_KEY. Declare the selected credential explicitly.`

`agy` 1.1.13 and later require both the key and a Gemini model-provider setting. On isolated providers, Outpost passes the key as `GEMINI_API_KEY` to every `agy` command and writes `~/.gemini/antigravity-cli/settings.json` containing `{"modelProvider":"gemini"}` in the private sandbox home. With `localSandboxProvider()`, only the variable is forwarded; the host settings file is neither read nor written, so configure it yourself. When `GOOGLE_API_KEY` is also present, `agy` gives it precedence. Gemini API requests are billed to the Gemini API project, separately from Google AI plans.

### Unsupported forms and token rotation

Antigravity has no long-lived account token, so `{ account: { key } }` and `{ account: { variable } }` fail when the agent is composed: `Antigravity does not support account.key authentication. Accepted forms: account, account.file, usage, usage.key, usage.variable`. Invalid shapes, empty values and invalid variable names fail the same way.

The sandbox copy of an account login may refresh its OAuth token and rotate the refresh token, which can invalidate the host copy and sign the host out. Keep a dedicated login file used only by Outpost and select it with `account.file`, for example `~/.outpost/accounts/antigravity-oauth-token`. Do not share one login between parallel sandboxes that refresh it independently.

## Configure execution

```ts
import {
  agent as composeAgent,
  antigravityHarness,
  dispatch,
} from "@elie-laloum/outpost";
import { localSandboxProvider } from "@elie-laloum/outpost/providers/local";

const key = process.env.GEMINI_API_KEY;
if (!key) throw new Error("Supply GEMINI_API_KEY before running this workflow");
const result = await dispatch({
  repository: "/path/to/repository",
  agent: composeAgent({
    harness: antigravityHarness({
      authentication: "usage",
      variables: { GEMINI_API_KEY: key },
      mode: "plan",
    }),
  }),
  sandboxProvider: localSandboxProvider(),
  branch: { mode: "named", name: "antigravity-review" },
  brief: { text: "Review the repository and report your findings." },
});
console.log(result.text, result.usage);
```

This example runs `agy` installed on the host. To isolate it, use `dockerSandboxProvider({ image })` from `@elie-laloum/outpost/providers/docker` with an image generated by `outpost init`, which contains `agy`, or another image that provides it. `model` on `agent()` accepts a model name supported by `agy` and is passed with `--model`; `reasoning` and `maxOutputTokens` are rejected when the agent is composed.

A headless run executes:

```sh
agy [--model MODEL] [--mode accept-edits|plan | --dangerously-skip-permissions] \
  --input-format stream-json --output-format stream-json
```

The prompt is written to stdin as one line, `{"event":"user","message":{"content":"…"}}`, the documented `agy` input channel since 1.1.15. Without `mode`, Outpost passes `--dangerously-skip-permissions`, allowing every tool to run unattended inside the selected sandbox; only select repositories whose project configuration you trust. `mode: "accept-edits"` or `mode: "plan"` passes `--mode` instead and applies that permission policy; approvals that require terminal input are unsuitable for unattended work. Outpost's provider supplies isolation; `localSandboxProvider()` remains unisolated. See the [headless documentation](https://antigravity.google/docs/cli/headless/).

Interactive sessions run `agy [--model MODEL] [--mode MODE] [--prompt-interactive TEXT]` in the CLI terminal interface, without `--dangerously-skip-permissions`. They require a provider with interactive terminal support, such as Docker, Podman or local execution. See [interactive sessions](../../../environment/commands/).

## Output and failures

Events are decoded by their `event` field. `init` reports the conversation ID. `step_update` records with `step_type: "agent_response"` become text observations from `text_delta`; `step_type: "tool"` records in the `DONE` or `ERROR` state become tool observations with `tool_name` and `tool_info.parameters`. Other records remain available in raw observations. A tool error can be handled by the agent; it does not by itself fail the dispatch.

The final `result` event decides the outcome. It succeeds only with `status: "SUCCESS"` and a nonempty `response`, which becomes the result text. Any other status, such as `CANCELED`, `ERROR` or `INTERRUPTED`, an empty response or a nonzero exit fails the dispatch. A final result is required: a zero exit without one also fails, so truncated output cannot silently succeed.

## Usage and session limits

The final result populates token usage once: `input_tokens` as input, `cache_read_tokens` as cached, and `output_tokens` plus `thinking_tokens` as output.

Antigravity sessions are fresh sessions only. The emitted conversation ID is informational: Outpost does not capture, relocate, restore, resume or fork `agy` conversations. `result.resume()`, `result.fork()` and explicit continuations fail with `Antigravity does not support continuation or fork in Outpost`, including within a warm sandbox. Additional passes start fresh sessions. Structured responses work with `repairs: 0`; automatic repair requires continuation and is rejected. Session resume is planned; see the [roadmap](../../../../project/roadmap/).

## Diagnose the installation

Inspect the installed CLI without model calls or credentials. Pass the image built by `outpost init`, or use `--sandbox-provider local` for a host installation:

```sh
npx @elie-laloum/outpost doctor --sandbox-provider docker --agent antigravity --image outpost:my-workflow
```

The check runs `agy --version` and `agy --help`, which must identify `Usage of agy:` and declare the options Outpost uses. The version is reported without comparison, since there is no pin. It does not authenticate an account or prove a live model's behavior.
