---
title: "Initialize a project"
description: "Initialize a project — Outpost"
sidebar:
  order: 4
---

`outpost init` generates editable project files. Run it from your target repository. Interactive mode asks for choices; automation should pass `--yes` or all required choices.

```sh
npx outpost init --yes --agent claude --provider podman --template plan-review --tracker github --label outpost-ready --install --build
```

| Flag           | Values / behavior                                                                  |
| -------------- | ---------------------------------------------------------------------------------- |
| `--yes`, `-y`  | Accept defaults without prompting.                                                 |
| `--agent`      | `codex` (default) or `claude`.                                                     |
| `--provider`   | `docker` (default), `podman`, `local`, `vercel`, `daytona`.                        |
| `--template`   | `blank` (default), `iterate`, `review`, `plan`, `plan-review`.                     |
| `--tracker`    | `github`, `beads`, `custom`; omitted headless default uses an in-memory objective. |
| `--manager`    | `npm`, `pnpm`, `yarn`, `bun`; otherwise detected from project metadata/lockfiles.  |
| `--model`      | Model name written into the generated adapter.                                     |
| `--install`    | Install Outpost and the selected optional SDK.                                     |
| `--build`      | Build the selected container image.                                                |
| `--image`      | Override generated image name.                                                     |
| `--label`      | Tracker label/filter; GitHub setup creates or updates it.                          |
| `--directory`  | Target project directory.                                                          |
| `--help`, `-h` | Display usage.                                                                     |

Initialization refuses existing scaffold files rather than overwriting them. It creates `.outpost/run.ts` for ESM projects and `.outpost/run.mts` otherwise, plus configuration, prompt/standards files and provider/tracker-specific files. The final output prints the exact run command.

## Templates

`blank` runs one dispatch. `iterate` delivers issues sequentially. `review` adds warm review. `plan` plans independent branches with bounded parallel work and integration. `plan-review` combines planning and review. Without a tracker, campaign starters wrap the command-line objective as one in-memory issue.

Edit the generated call to change limits and role adapters. Standards live in `.outpost/STANDARDS.md`. The CLI is a starting point; library calls remain the source of runtime behavior.
