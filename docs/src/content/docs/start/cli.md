---
title: "Initialize a project"
description: "Initialize a project — Outpost"
sidebar:
  order: 4
---

`outpost init` creates a workflow project in the current directory or `--directory`. This directory can be independent of the target Git repositories. Interactive mode asks for choices; automation should pass `--yes` or all required choices.

```sh
npx @elie-laloum/outpost init --yes --agent claude --provider podman --repository /path1/repository --install --build
```

| Flag           | Values / behavior                                                                    |
| -------------- | ------------------------------------------------------------------------------------ |
| `--yes`, `-y`  | Accept defaults without prompting.                                                   |
| `--agent`      | `codex` (default) or `claude`.                                                       |
| `--provider`   | `docker` (default), `podman`, `local`, `vercel`, `daytona`.                          |
| `--manager`    | `npm`, `pnpm`, `yarn`, `bun`; otherwise detected from project metadata/lockfiles.    |
| `--model`      | Model name written into the generated adapter.                                       |
| `--install`    | Install Outpost and the selected optional SDK.                                       |
| `--build`      | Build the selected container image.                                                  |
| `--image`      | Override generated image name.                                                       |
| `--directory`  | Workflow directory; current directory by default.                                    |
| `--repository` | Target Git repository; absolute or relative to the workflow directory. Default: `.`. |
| `--help`, `-h` | Display usage.                                                                       |

Initialization creates `run.ts`, `brief.md`, `.env.example`, `.gitignore`, a `package.json` and provider-specific files directly in that directory. The manifest includes a `start` script, Outpost and the optional cloud SDK; `--install` installs these dependencies. Existing package manifests are preserved and missing ignore rules are appended to `.gitignore`. Any collision with the other generated files fails initialization before writing.

The script defaults to `run.ts`. If an existing manifest declares `"type": "commonjs"`, `init` generates `run.mts` to preserve ESM compatibility without changing that manifest. Node.js 24+ executes these TypeScript files directly.

## Generated script

The script runs one `dispatch` with the objective supplied on the command line. Edit `brief.md` to customize the prompt and `run.ts` to configure execution. Copy `.env.example` to `.env` in the workflow directory: the script passes declared variables to the provider. An empty declaration inherits the matching process variable.

Repository, brief and environment paths are resolved from the script directory, regardless of the launch directory. With `--directory /path2/workflow1`, run `node /path2/workflow1/run.ts "My objective"`, or enter that directory and run `npm start -- "My objective"` after installing dependencies.

The workflow directory does not need to be a Git repository. The target repository must have a commit. Worktrees, locks and logs remain under the target repository’s `.outpost`. To work on several repositories, compose tasks with their own `repository`: see [multi-repository workflows](../../workflows/sandbox-tasks/#multiple-repositories).

See [choose a repository](../../sandboxes/repositories/) for workflow directories, target repositories and relative paths.

Use `outpost <command> --help` for command-specific options. Interactive initialization uses selection lists; Ctrl+C cancels before project files are written. JSON reports and headless commands keep plain output.
