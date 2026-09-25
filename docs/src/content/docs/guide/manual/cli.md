---
title: "Initialize a project"
description: "Initialize a project — Outpost"
sidebar:
  order: 4
---

`outpost init` creates a workflow project in the current directory or `--directory`. This directory can be independent of the target Git repositories. Interactive mode asks for choices; automation should pass `--yes` or all required choices.

```sh
npx @elie-laloum/outpost init --yes --agent claude --provider podman --repository /path1/repository --install
```

| Flag           | Values / behavior                                                                    |
| -------------- | ------------------------------------------------------------------------------------ |
| `--yes`, `-y`  | Accept defaults without prompting.                                                   |
| `--agent`      | `codex` (default), `claude` or `gemini`.                                             |
| `--provider`   | `docker` (default), `podman`, `local`, `vercel`, `daytona`.                          |
| `--manager`    | `npm`, `pnpm`, `yarn`, `bun`; otherwise detected from project metadata/lockfiles.    |
| `--model`      | Model name written into the generated adapter.                                       |
| `--install`    | Install Outpost and the selected optional SDK.                                       |
| `--build`      | Build the container image (automatic for Docker/Podman).                             |
| `--image`      | Override generated image name.                                                       |
| `--directory`  | Workflow directory; current directory by default.                                    |
| `--repository` | Target Git repository; absolute or relative to the workflow directory. Default: `.`. |
| `--help`, `-h` | Display usage.                                                                       |

Initialization creates `run.ts`, `brief.md`, `.env.example`, `.gitignore`, a `package.json` and provider-specific files directly in that directory. The manifest includes a `start` script, Outpost and the optional cloud SDK; `--install` installs these dependencies. Existing package manifests are preserved and missing ignore rules are appended to `.gitignore`. Any collision with the other generated files fails initialization before writing.

The script defaults to `run.ts`. If an existing manifest declares `"type": "commonjs"`, `init` generates `run.mts` to preserve ESM compatibility without changing that manifest. Node.js 24+ executes these TypeScript files directly.

## Generated script

The script runs one `dispatch` with the objective supplied on the command line. Edit `brief.md` to customize the prompt and `run.ts` to configure execution. Copy `.env.example` to `.env` in the workflow directory: the script passes declared variables to the provider. An empty declaration inherits the matching process variable.

Repository, brief and environment paths are resolved from the script directory, regardless of the launch directory. With `--directory /path2/workflow1`, run `node /path2/workflow1/run.ts "My objective"`, or enter that directory and run `npm start -- "My objective"` after installing dependencies.

The workflow directory does not need to be a Git repository. The target repository must have a commit. Worktrees, locks and logs remain under the target repository’s `.outpost`. To work on several repositories, compose tasks with their own `repository`: see [multi-repository workflows](../../behavior/workflows/sandbox-tasks/#multiple-repositories).

See [choose a repository](../../environment/repositories/) for workflow directories, target repositories and relative paths.

Use `outpost <command> --help` for command-specific options. Interactive initialization uses selection lists; Ctrl+C cancels before project files are written. JSON reports and headless commands keep plain output.

## Authentication and prerequisites

Interactive setup asks for the agent, sandbox provider, package manager and authentication method. `--manager` overrides project metadata and lockfile detection. With `--install`, an unavailable manager fails before any files are generated; install that manager or explicitly select another installed one. Without `--install`, install the generated dependencies before running the workflow.

`--authentication api-key` is the default: set `OPENAI_API_KEY`, `ANTHROPIC_API_KEY` or `GEMINI_API_KEY` for the selected agent. The generated script checks the credential before allocation, forwards it explicitly and prepares Codex login through stdin inside the sandbox. API billing is separate from subscriptions. The selected credential can be supplied directly in the parent environment even when `.env` does not exist; additional variables must be declared in `.env`.

For Claude subscriptions, select `--authentication oauth-token`, run `claude setup-token` on the host, and provide `CLAUDE_CODE_OAUTH_TOKEN` to the workflow. Keep `ANTHROPIC_API_KEY` out of that workflow environment. A host browser login alone does not connect Claude inside Vercel or Daytona. See [Claude authentication](../../agents/connect-claude/).

For Codex account login, select `--authentication login` and run `codex login` on the host. Local execution uses the host session. Isolated providers receive a private copy of the host `CODEX_HOME/auth.json` (default `~/.codex/auth.json`) in the ephemeral sandbox home. This requires file credential storage; OS keychain credentials are not exported. The host seed is not updated when the sandbox refreshes tokens. See [Codex authentication](../../agents/connect-codex/).

Docker/Podman images build automatically. Use `--no-build` to generate files only, then run `outpost image build --engine docker --directory <workflow>` (or `podman`) when ready. The engine and daemon must be available. If installation or image building fails after generation, keep the generated files and rerun the failed install/build command; do not rerun initialization over those files. Cloud allocation credentials remain in the host environment and are separate from model credentials.

## Custom model endpoint

For a Codex model served by an OpenAI Responses-compatible service:

```sh
npx @elie-laloum/outpost init --yes --agent codex --provider docker --model vendor/model --base-url https://models.example.com/v1 --api-key-env MODEL_API_KEY --install
```

Set `MODEL_API_KEY` in the parent environment or workflow `.env` before running. `--api-key-env` defaults to `OPENAI_API_KEY` and requires `--base-url`; the custom endpoint requires `--model`. This path uses the custom provider directly without OpenAI account login. Chat Completions-only endpoints are unsupported. See [custom model providers](../../behavior/agents/connect-codex/#openai-compatible-model-providers).
