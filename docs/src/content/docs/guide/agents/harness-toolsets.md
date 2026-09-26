---
title: Built-in harness toolsets (experimental)
description: Give a custom harness repository tools to read, search, edit, run commands and inspect Git.
---

:::caution[Experimental API]
These toolsets are experimental since 5.0.0 and belong to the [custom harness](../harness/) engine. They have been tested with the local sandbox provider only.
:::

Outpost provides five toolsets for a [custom harness](../harness/). Each returns a `defineHarnessToolset()` result, so you can combine them with your own tools and restrict them with [permissions](../harness/#control-the-loop-with-hooks-and-permissions).

| Toolset                | Tools                     | Needs in the sandbox | Read-only |
| ---------------------- | ------------------------- | -------------------- | --------- |
| `harnessFileTools()`   | `read_file`, `list_files` | Git                  | Yes       |
| `harnessEditTools()`   | `write_file`, `edit_file` | —                    | No        |
| `harnessSearchTools()` | `search`                  | Git                  | Yes       |
| `harnessGitTools()`    | `git`                     | Git                  | Yes       |
| `harnessShellTools()`  | `shell`                   | POSIX `sh`           | No        |

```ts
import {
  agent,
  anthropicModelProvider,
  defineHarnessPermissions,
  harness,
  harnessEditTools,
  harnessFileTools,
  harnessGitTools,
  harnessSearchTools,
  harnessShellTools,
} from "@elie-laloum/outpost";

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) throw new Error("Set ANTHROPIC_API_KEY");

export const engineer = agent({
  model: {
    name: "claude-sonnet-5",
    reasoning: "high",
    maxOutputTokens: 16_000,
  },
  harness: harness({
    modelProvider: anthropicModelProvider({ apiKey }),
    instructions: "Read the relevant code before changing it. Run the tests.",
    tools: [
      harnessFileTools(),
      harnessSearchTools(),
      harnessGitTools(),
      harnessEditTools(),
      harnessShellTools({ deadlineMs: 600_000 }),
    ],
    permissions: defineHarnessPermissions({
      rules: [
        { effect: "deny", commands: ["git push*", "rm -rf *"] },
        {
          effect: "allow",
          tools: ["write_file", "edit_file"],
          paths: ["src/**", "test/**"],
        },
        { effect: "deny", tools: ["write_file", "edit_file"] },
      ],
    }),
  }),
});
```

## What each tool does

- **`read_file`** `{ path, offset?, limit? }` returns numbered lines of a UTF-8 file, 2,000 lines at most per call, with a note when the file has more. Binary files, files over 4 MiB and symbolic links are refused.
- **`list_files`** `{ path?, pattern? }` lists files that Git tracks or does not ignore, up to 1,000 entries. `pattern` is a glob such as `src/**/*.ts`; a glob without a slash, such as `*.md`, matches file names at any depth.
- **`write_file`** `{ path, content }` creates or replaces a file, creating missing directories. The file gets default permissions.
- **`edit_file`** `{ path, old_text, new_text, replace_all? }` replaces exact text. `old_text` must appear exactly once unless `replace_all` is set, so the model includes enough context to be unambiguous. Line endings and file permissions are kept, and the edit is refused if the file changed while it was being edited.
- **`search`** `{ pattern, path?, glob?, ignore_case?, max_results? }` searches an extended regular expression with `git grep` in tracked and non-ignored files and returns `path:line:text` matches, 200 at most.
- **`git`** `{ command, arguments? }` runs `status`, `diff`, `log` or `show`. Options that write files or run external programs, such as `--output` or `--ext-diff`, are refused.
- **`shell`** `{ command }` runs `sh -c` in the repository root without input and returns the exit status, stdout and stderr. A nonzero status is reported to the model as an error. The command deadline defaults to two minutes; the harness `toolExecution.deadlineMs` also applies.

Paths are relative to the repository root. Absolute paths and paths that leave the repository are refused. Command output keeps the last 200,000 characters and says when it was truncated.

## How files move

File tools download a file from the sandbox into a private temporary directory on the host, work on it there, and upload the result. This is binary-safe and works with every sandbox provider, including remote ones, without requiring tools inside the sandbox. Listing and search run `git` in the sandbox, and `shell` needs a POSIX shell: they are unavailable in a local sandbox on Windows without Git or `sh`.

## Permissions and safety

Every built-in tool declares its resources: file tools declare their paths, and `shell` and `git` declare their command line. Permission rules match these resources. They reduce mistakes but are not a security boundary: a shell command can reach any path, and symbolic links inside the repository can point elsewhere. Run untrusted work in an isolated [sandbox provider](../../environment/providers/overview/).

[Build a custom harness](../harness/) · [Harness reference](../../../reference/overview/harness/)
