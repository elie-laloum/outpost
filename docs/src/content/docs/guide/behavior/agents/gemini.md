---
title: Run Gemini CLI
description: Run Gemini in a sandbox with streamed output and explicit session limits.
sidebar:
  order: 7
---

`agent({ harness: gemini.harness() })` runs the native Gemini CLI through the same sandbox providers as the other adapters. Generated Docker/Podman recipes install Gemini alongside Claude Code and Codex; remote providers bootstrap the pinned CLI when needed unless `bootstrap: false`. For `localSandboxProvider()`, install `@google/gemini-cli` yourself; this provider runs directly on the host.

## Create a workflow

Requires Node.js 24+, Git, Docker and a repository with an initial commit:

```sh
mkdir gemini-workflow
cd gemini-workflow
npx @elie-laloum/outpost init --yes --agent gemini --sandbox-provider docker \
  --repository /path/to/repository --install --build
```

Copy `.env.example` to `.env`, leaving `GEMINI_API_KEY=` as an empty declaration to inherit a key supplied by your parent process or secret manager. Run the generated `node run.ts "Your task"`. This makes real model requests and may incur API usage charges. Never put credentials in the image, prompt or committed files.

A Gemini API key uses the Gemini API account's quotas and billing. Google account login is a separate CLI authentication method with its own eligibility and limits; a Google AI subscription does not turn an API key into subscription authentication. For local account login, run `gemini` interactively and follow its browser flow. `localSandboxProvider()` can use host login state; a container has its own ephemeral private home and does not inherit that state. Outpost does not relocate Gemini login credentials or persist a partial home. Follow the current [Gemini authentication instructions](https://geminicli.com/docs/get-started/authentication/) when selecting Google login, an API key or Vertex AI.

## Configure execution

```ts
import { agent as composeAgent, dispatch, gemini } from "@elie-laloum/outpost";
import { dockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";

const key = process.env.GEMINI_API_KEY;
if (!key) throw new Error("Supply GEMINI_API_KEY before running this workflow");
const result = await dispatch({
  repository: "/path/to/repository",
  agent: composeAgent({
    harness: gemini.harness({ variables: { GEMINI_API_KEY: key } }),
    model: "flash",
  }),
  sandboxProvider: dockerSandboxProvider(),
  branch: { mode: "named", name: "gemini-review" },
  brief: { text: "Review the repository and report your findings." },
});
console.log(result.text, result.usage);
```

Build the generated image before this example. `model` accepts a Gemini CLI model name or alias. Headless commands send the prompt through stdin and request `stream-json`. The default headless `approvalMode` is `yolo`, allowing tools to run unattended inside the selected environment. In this mode, Outpost also passes `--skip-trust` to trust the selected workspace for the invocation, allowing a fresh private home to run unattended. Only select repositories whose project configuration you trust. See [Gemini folder trust](https://geminicli.com/docs/cli/trusted-folders/#headless-and-automated-environments). Set `approvalMode` explicitly to `default`, `auto_edit` or `plan` when appropriate; approvals that require terminal input are unsuitable for unattended work. Outpost's provider supplies isolation; `localSandboxProvider()` remains unisolated.

Interactive sessions use the CLI terminal interface and default to `approvalMode: "default"`. They require a provider with interactive terminal support, such as Docker, Podman or local execution. An initial prompt uses `--prompt-interactive`. See [interactive sessions](../../../environment/commands/) and the official [CLI options](https://geminicli.com/docs/cli/cli-reference/).

## Output and session boundaries

Assistant message chunks become text observations, tool calls become tool observations, and warnings remain nonfatal. Tool results and unknown protocol records remain available in raw observations. A tool error can be handled by the agent; it does not by itself fail the entire dispatch. Protocol errors, a failed final result or a nonzero CLI exit fail the dispatch. A zero exit without a successful final result also fails, so truncated output cannot silently succeed. Completion markers wait for the final result before starting the settle timeout.

Final aggregate statistics populate input, cached and output token usage once. Per-model breakdowns remain in raw events. The emitted session ID is informational: Outpost does **not** capture, relocate, restore, resume or fork Gemini native transcripts. `result.resume()`, `result.fork()` and explicit continuations fail clearly, including within a warm sandbox. Additional passes start fresh sessions. Structured responses work with `repairs: 0`; automatic repair requires continuation and is rejected.

The adapter and image pin are tested with deterministic protocol fixtures and credential-free CLI help checks. These checks do not prove a live model's behavior or authenticate an account. Inspect installed CLI support without model calls:

```sh
npx @elie-laloum/outpost doctor --sandbox-provider docker --agent gemini
```

The headless protocol follows Gemini's [streaming output documentation](https://geminicli.com/docs/cli/headless/). `agentVersions.gemini` reports the pinned reference version.
