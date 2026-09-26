---
title: Authentication
description: Account and usage credentials for every agent, where Outpost reads them and how it installs them in a sandbox.
---

A CLI harness authenticates only when you select a credential with its `authentication` option, or with `outpost init --authentication`. Outpost then prepares that credential in the sandbox before the agent's first run. Without `authentication`, Outpost prepares nothing and the CLI uses whatever its environment already provides.

Start with the [complete first run](../../start/quickstart/) for a working setup, then return here for the exact contract.

## Two families

| Family    | What it uses                                                                                   | Billing                                                                                                                     |
| --------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `account` | Your plan or subscription login: ChatGPT, Claude, Google account, GitHub Copilot or Kimi Code. | Consumes the plan's quotas and limits. GitHub Copilot counts premium requests on your GitHub plan.                          |
| `usage`   | An API key from the vendor's developer platform.                                               | Billed per use by that platform, separately from any subscription. A subscription does not cover API usage, and vice versa. |

Choose one family per agent. Claude Code gives an API key precedence over a subscription login, so Outpost rejects a Claude configuration that declares both instead of silently billing the API.

## The seven forms

| Form                        | Reads                                                                                                                                                   |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `"account"`                 | The CLI's default login file on the host (see the [agent matrix](#agent-matrix)).                                                                       |
| `{ account: { file } }`     | That login file at an explicit host path; Kimi Code takes a profile directory. `~` is expanded and a relative path resolves from the process directory. |
| `{ account: { key } }`      | A literal account token. Avoid it in committed code.                                                                                                    |
| `{ account: { variable } }` | An account token from the named workflow variable.                                                                                                      |
| `"usage"`                   | The agent's default API-key variable, which must be declared.                                                                                           |
| `{ usage: { key } }`        | A literal API key. Avoid it in committed code.                                                                                                          |
| `{ usage: { variable } }`   | An API key from the named workflow variable.                                                                                                            |

The option is typed `AgentAuthentication`; its inner objects are `AccountCredential` and `UsageCredential`. The same option exists on `claudeHarness()`, `codexHarness()`, `antigravityHarness()`, `copilotHarness()` and `kimiHarness()`.

```ts
import {
  agent,
  claudeHarness,
  codexHarness,
  copilotHarness,
  kimiHarness,
  type AccountCredential,
  type AgentAuthentication,
  type UsageCredential,
} from "@elie-laloum/outpost";

// Subscription login stored by the CLI on the host.
const claude = agent({ harness: claudeHarness({ authentication: "account" }) });

// API billing with a key declared under another name.
const teamKey: UsageCredential = { variable: "TEAM_OPENAI_KEY" };
const codex = agent({
  harness: codexHarness({ authentication: { usage: teamKey } }),
});

// A dedicated login file used only by Outpost.
const dedicated: AccountCredential = {
  file: "~/.outpost/accounts/codex/auth.json",
};
const codexAccount = agent({
  harness: codexHarness({ authentication: { account: dedicated } }),
});

// A GitHub token read from the workflow variables.
const copilot = agent({
  harness: copilotHarness({
    authentication: { account: { variable: "COPILOT_GITHUB_TOKEN" } },
  }),
});

// Kimi API keys need a model name on agent().
const usage: AgentAuthentication = "usage";
const kimi = agent({
  harness: kimiHarness({ authentication: usage }),
  model: "moonshot-model-id",
});
console.log([claude, codex, codexAccount, copilot, kimi].map((a) => a.name));
```

Replace `moonshot-model-id` with a model identifier available to your Moonshot platform account.

## Agent matrix

### Supported forms

| Agent                                     | `account` | `account.file`   | `account.key`, `account.variable` | `usage`, `usage.key`, `usage.variable` |
| ----------------------------------------- | --------- | ---------------- | --------------------------------- | -------------------------------------- |
| Claude Code (`claudeHarness`)             | Yes       | Yes              | Yes: `CLAUDE_CODE_OAUTH_TOKEN`    | Yes: `ANTHROPIC_API_KEY`               |
| Codex (`codexHarness`)                    | Yes       | Yes              | No                                | Yes: `OPENAI_API_KEY`                  |
| Antigravity (`antigravityHarness`, `agy`) | Yes       | Yes              | No                                | Yes: `GEMINI_API_KEY`                  |
| GitHub Copilot (`copilotHarness`)         | Yes       | Yes              | Yes: `COPILOT_GITHUB_TOKEN`       | No: requests use your Copilot plan     |
| Kimi Code (`kimiHarness`)                 | Yes       | Yes: a directory | No                                | Yes: `KIMI_API_KEY`, model required    |

The named variable is the one the CLI receives in the sandbox. `"usage"` reads it from the workflow variables; a `variable` form reads another name and passes the value under this one; a `key` form passes the literal value.

### Account files

| Agent          | Host source (override variable)                                                              | Sandbox destination                                                                | Host login                                                 |
| -------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Claude Code    | `~/.claude/.credentials.json` (`$CLAUDE_CONFIG_DIR/.credentials.json`)                       | `~/.claude/.credentials.json`, containing only the `claudeAiOauth` entry           | `claude`, then `/login`                                    |
| Codex          | `~/.codex/auth.json` (`$CODEX_HOME/auth.json`)                                               | `~/.codex/auth.json`                                                               | `codex -c cli_auth_credentials_store='"file"' login`       |
| Antigravity    | `~/.gemini/antigravity-cli/antigravity-oauth-token` (no override)                            | The same path in the sandbox home                                                  | `agy`, then sign in with your Google account               |
| GitHub Copilot | `~/.copilot/config.json` (`$COPILOT_HOME/config.json`)                                       | No file: the token of the last logged-in user becomes `COPILOT_GITHUB_TOKEN`       | `copilot login`                                            |
| Kimi Code      | `~/.kimi-code/credentials/kimi-code.json` and `~/.kimi-code/device_id` (`$KIMI_CODE_HOME/…`) | The same files under `~/.kimi-code`, then Outpost runs `kimi login` in the sandbox | `kimi login` (add `--region global` for a kimi.ai account) |

Agent-specific rules:

- **Claude Code** copies only the subscription login; other entries of `.credentials.json`, such as MCP OAuth tokens, stay on the host. A declared `ANTHROPIC_API_KEY` makes every account form fail, and a declared `CLAUDE_CODE_OAUTH_TOKEN` makes every usage form fail. `claude setup-token` creates a long-lived subscription token for the token forms.
- **Codex** requires `auth.json` to be valid JSON and has no account-token form. `usage` passes `OPENAI_API_KEY` to the CLI and runs `codex login --with-api-key` in the sandbox, with the key on stdin. With a custom `modelProvider`, Codex accepts only `usage`, `usage.key` and `usage.variable`: they set the `modelProvider.apiKeyEnvironment` variable (default `OPENAI_API_KEY`) and run no login. With `apiKeyEnvironment: false`, no authentication form is accepted.
- **Antigravity** `usage` also writes `~/.gemini/antigravity-cli/settings.json` containing `{"modelProvider":"gemini"}` in the sandbox; `agy` needs both the key and this setting. A `GOOGLE_API_KEY` present in the sandbox takes precedence inside `agy`.
- **GitHub Copilot** reads `config.json` as JSON with comments, extracts `authTokens["<host>:<login>"]` for `lastLoggedInUser` and copies no file. A token must be a fine-grained personal access token with the "Copilot Requests" permission or an OAuth token (`gho_`, `ghu_`); classic `ghp_` tokens are rejected.
- **Kimi Code** `account.file` names the profile directory that contains `credentials/kimi-code.json` and `device_id`. The sandbox `kimi login`, bounded to 120 seconds, refreshes the token if needed and regenerates `config.toml` with the managed model catalog, as the host login does. Only the default region is exercised by this sandbox login. `usage` translates `KIMI_API_KEY` to `KIMI_MODEL_API_KEY`, `KIMI_MODEL_PROVIDER_TYPE=kimi` and `KIMI_MODEL_NAME` (the agent's model), and Outpost does not pass `--model`. Kimi's default base URL for this configuration is the Moonshot platform, `https://api.moonshot.ai/v1`; set `KIMI_MODEL_BASE_URL` in the workflow variables to change it. In account mode, model names are Kimi configuration aliases such as `kimi-code/<id>`.

The Antigravity, Copilot and Kimi adapters also disable CLI self-updates through default variables (`AGY_CLI_DISABLE_AUTO_UPDATE=true`, `COPILOT_AUTO_UPDATE=false`, `KIMI_CODE_NO_AUTO_UPDATE=1`). A harness `variables` entry with the same name overrides them.

## Host and sandbox locations

Outpost reads account files **on the host**, in the process that runs your workflow. It reads only regular files of at most 1 MiB and refuses symbolic links and directories; a Kimi profile directory only locates its two files. File contents never appear in error messages.

Variable forms read the **resolved workflow variables**: the harness `variables`, the sandbox provider `variables` and the declarations in the target repository's `.outpost/.env`. An empty declaration inherits the host process variable of the same name. A host variable declared nowhere is not visible, so `"usage"` fails with `Missing OPENAI_API_KEY` even when your shell exports it. The generated starter declares the default variable of the selected form automatically; see [configuration precedence](../configuration/).

In the sandbox, credentials live in the **private home**. It is ephemeral: disposing of the sandbox discards the copied login, and [conversation capture](../../agents/conversations/) preserves transcripts, not authentication.

## Isolated sandboxes

Docker, Podman, Vercel, Daytona and Firecracker sandboxes receive credentials the same way. On the first dispatch or interactive attach of an agent in a sandbox, Outpost:

1. Reads the selected host files and resolves the selected variables.
2. Writes the files into the sandbox home with **one** `node -e` installer that receives a JSON document on stdin, so no secret appears in a command argument. The installer refuses absolute paths and `..`, empty or `.` segments, creates missing directories with mode `0700` and writes each file with mode `0600` through a temporary file renamed into place.
3. Runs the agent's login command, if any: `codex login --with-api-key` for Codex usage, `kimi login` for a Kimi account. Secrets travel on stdin.
4. Adds the credential variables to every command of that agent in this sandbox.

This happens once per agent per sandbox; a warm sandbox reuses the prepared home. The installer uses the sandbox's `node`, which generated images and remote bootstrap provide.

## Local provider

`localSandboxProvider()` runs the CLI on the host. Outpost copies or writes no file and runs no login command there; it only forwards the credential variables. Consequently:

- `account` and `account.file` rely on the CLI's own host login; the file named by `account.file` is not read.
- Copilot uses its own host login, including one kept in the keychain.
- Codex `usage` passes `OPENAI_API_KEY` without running `codex login --with-api-key`, so your host `~/.codex/auth.json` is never overwritten.
- Antigravity `usage` does not write `settings.json`; your host `agy` settings apply.

## System keychains

Outpost never reads a system keychain: macOS Keychain, libsecret or Windows Credential Manager. A CLI that keeps its login there leaves no file for `account` to copy, and the error says so. Use one of these routes:

- **Claude Code on macOS** keeps its login in the Keychain. Create a token with `claude setup-token` and select `{ account: { variable: "CLAUDE_CODE_OAUTH_TOKEN" } }`.
- **Codex** stores its login in a file only with `cli_auth_credentials_store = "file"`; sign in again with `codex -c cli_auth_credentials_store='"file"' login`.
- **GitHub Copilot** uses the keychain by default and writes a plaintext token to `config.json` only when no keychain is available or with `storeTokenPlaintext: true`. Otherwise select `{ account: { variable: "COPILOT_GITHUB_TOKEN" } }` with a fine-grained token.
- **Antigravity** uses the OS keyring when a D-Bus session exists and falls back to the token file otherwise. Sign in where no keyring is available, or use `usage`. An upstream issue (google-antigravity/antigravity-cli#479) reports a file-stored login not being read back by a fresh process; Outpost has not verified this live with `agy` 1.2.x.

## Refresh tokens and dedicated profiles

Claude Code, Codex, Kimi Code and Antigravity sessions can rotate their refresh token when the sandbox copy refreshes. The host copy then holds a revoked token, and your everyday CLI can find itself logged out.

Give Outpost a dedicated profile that you do not use interactively, and point `account.file` at it:

```sh
mkdir -p ~/.outpost/accounts/codex ~/.outpost/accounts/claude ~/.outpost/accounts/copilot ~/.outpost/accounts/kimi
CODEX_HOME=~/.outpost/accounts/codex codex -c cli_auth_credentials_store='"file"' login
CLAUDE_CONFIG_DIR=~/.outpost/accounts/claude claude # then /login; not on macOS
COPILOT_HOME=~/.outpost/accounts/copilot copilot login
KIMI_CODE_HOME=~/.outpost/accounts/kimi kimi login
```

For Antigravity, sign in with a separate `HOME`, for example `HOME=~/.outpost/accounts/antigravity agy`, where no keyring is available, and point `account.file` at `.gemini/antigravity-cli/antigravity-oauth-token` under that directory.

```ts
import {
  agent,
  claudeHarness,
  codexHarness,
  copilotHarness,
  kimiHarness,
} from "@elie-laloum/outpost";

const accounts = "~/.outpost/accounts";
const agents = [
  agent({
    harness: codexHarness({
      authentication: { account: { file: `${accounts}/codex/auth.json` } },
    }),
  }),
  agent({
    harness: claudeHarness({
      authentication: {
        account: { file: `${accounts}/claude/.credentials.json` },
      },
    }),
  }),
  agent({
    harness: copilotHarness({
      authentication: { account: { file: `${accounts}/copilot/config.json` } },
    }),
  }),
  agent({
    harness: kimiHarness({
      authentication: { account: { file: `${accounts}/kimi` } },
    }),
  }),
];
console.log(agents.map((selected) => selected.name));
```

The dedicated profile protects your everyday login, but it can itself become stale after a sandbox refresh: sign in to it again when a run reports rejected credentials, and do not share it between concurrent workflows. Where a long-lived token exists, prefer it: `claude setup-token` for Claude Code, a fine-grained token for Copilot.

## When errors appear

**When `agent()` composes the harness**, and during `outpost init`, which composes it to validate the scaffold:

- An invalid shape: more than one key, an unknown key, an empty string or an invalid variable name.
- A form the agent does not accept. The message lists the accepted forms, for example `Codex does not support account.key authentication. Accepted forms: account, account.file, usage, usage.key, usage.variable`.
- A classic `ghp_` token given to Copilot with `account.key`.
- Kimi `usage` without a model on `agent()`.

**When the sandbox is prepared** for the agent's first dispatch or attach:

- A missing variable: `Missing NAME. Declare the selected credential explicitly.`
- A missing host file. The message names the path, the login command to run and the `key` or `variable` alternative, and states that the keychain is never read.
- A link, a directory or a file larger than 1 MiB; an invalid Codex `auth.json`; a Claude file without `claudeAiOauth`; a Copilot `config.json` without a token for the last user.
- Conflicting Claude credentials, or a classic `ghp_` token read by Copilot from a variable.
- A failing login command in the sandbox.

**When the model is called**, an expired, revoked or ineligible credential appears as an agent CLI error. Neither `outpost doctor` nor a successful sandbox allocation proves that a model accepts the credential.

## Generated workflows

`outpost init --agent <agent> --authentication account|account-token|usage` writes the selected form into the generated `run.ts`, which reads no credential file itself.

| Choice          | Generated setting                                                                                     | `.env.example`                        |
| --------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------- |
| `account`       | `authentication: "account"`                                                                           | No credential variable.               |
| `account-token` | `{ account: { variable: "CLAUDE_CODE_OAUTH_TOKEN" } }` for Claude, `COPILOT_GITHUB_TOKEN` for Copilot | That variable.                        |
| `usage`         | `authentication: "usage"`                                                                             | The agent's default API-key variable. |

`account` is the default, or `usage` with `--base-url`. Kimi `usage` requires `--model`. See the [CLI contract](../cli/).

## Migrate from the removed modes

The `{ mode: "api-key" | "oauth-token" | "login" }` shapes, their `environment` and `credentials` fields, and `--authentication api-key|oauth-token|login` no longer exist and have no aliases.

| Removed                                                        | Replacement                                                                                            |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `{ mode: "api-key" }`                                          | `"usage"`                                                                                              |
| `{ mode: "api-key", environment: "TEAM_KEY" }`                 | `{ usage: { variable: "TEAM_KEY" } }`                                                                  |
| `{ mode: "oauth-token" }` (Claude)                             | `{ account: { variable: "CLAUDE_CODE_OAUTH_TOKEN" } }`                                                 |
| `{ mode: "login" }`                                            | `"account"`                                                                                            |
| `{ mode: "login", credentials: await readFile(path, "utf8") }` | `{ account: { file: path } }`: Outpost now reads the file itself                                       |
| Hooks copying `auth.json` or running `codex login`             | `"account"`, `{ account: { file } }` or `"usage"`; remove the hook so the login is not prepared twice. |
| `--authentication api-key`, `oauth-token`, `login`             | `--authentication usage`, `account-token`, `account`                                                   |
| `geminiHarness()`                                              | `antigravityHarness()`: Gemini CLI no longer serves free, Google AI Pro and Ultra accounts.            |

## Cloud allocation is a separate login

Vercel and Daytona credentials authorize sandbox allocation and remain independent of the agent credentials. Use the provider's declared connection settings or environment variables; do not add cloud allocation secrets to the agent variables unless that agent actually needs them. The [remote recipe](../../cookbook/remote/) gives the complete SDK and environment preparation.

## Diagnose a failed login

Check, in order: the selected form, the declared variable or host file named in the error, a keychain-only login, a conflicting Claude variable, and whether your plan or API account has access to the model. Recreate the sandbox after changing authentication. Do not print secrets while debugging.

Agent guides: [Codex](../../agents/connect-codex/), [Claude Code](../../agents/connect-claude/), [Antigravity](../../agents/connect-antigravity/), [GitHub Copilot](../../agents/connect-copilot/) and [Kimi Code](../../agents/connect-kimi/). Custom Codex model providers require a Responses-compatible endpoint; see the [provider contract](../../behavior/agents/connect-codex/#openai-compatible-model-providers).

Vendor sources: [Claude authentication](https://code.claude.com/docs/en/authentication), [Codex authentication](https://developers.openai.com/codex/auth/), [Antigravity CLI installation](https://antigravity.google/docs/cli/install/) and [headless mode](https://antigravity.google/docs/cli/headless/), [Copilot CLI configuration directory](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-config-dir-reference).
