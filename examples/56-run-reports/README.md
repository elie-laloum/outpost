# Run reports

From the repository root, with Node.js 24+ and installed dependencies:

```sh
bun run build
node examples/56-run-reports/index.ts
```

This offline demonstration uses a simulated model, real shell commands and a temporary worktree on a demo repository. The explicitly unisolated local provider executes only the commands declared in `model.ts`; no account, container or paid model request is needed. The first command deliberately exits with status 7, and the next updates and commits the README. Dispatch integrates that commit and closes the worktree.

Inspect `state/run-report.md` and `state/run-report.json`. They contain one changed file, the failed command, total duration, tokens and an illustrative EUR estimate. The report remains usable after workspace cleanup. Rerunning the example reuses `examples/.repos/56-run-reports` and creates another commit.

The diff includes only committed changes. Failed tools are observed adapter events, and the completion marker is not a test assertion. Markdown is suitable for a PR description; JSON lets your application build a Slack message. The example writes local files and sends no messages.
