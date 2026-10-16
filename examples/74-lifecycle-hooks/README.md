# Lifecycle hooks

Run the Outpost loop offline, or select one of the five native CLI harnesses.
All imports use the public package built from this checkout.

## Outpost: callbacks and a command hook

From the repository root, with Node.js 24+ and Git:

```sh
bun install --frozen-lockfile
bun run build
node examples/74-lifecycle-hooks/index.ts
```

This default mode needs no account, API key, Docker or network. It uses a
deterministic model provider and the explicitly unisolated local sandbox.
`profile.ts` shares hooks through `defineAgentProfile({ hooks })`: a separate
section for each CLI and `outpost` for the built-in loop. Each harness selects
only its section, then appends its own hooks. An empty local array keeps the
profile hooks; native execution order still follows the CLI.

Together, `profile.ts` and `outpost.ts` demonstrate eight phases: session start, prompt transformation,
model request and response transformation, before and after tool execution,
stop and run end. `repo/scripts/prompt-hook.mjs` runs as a sandbox command with
JSON stdin/stdout; the other hooks are host TypeScript callbacks.

Expect a successful `read_file` call, an answer beginning with `Reviewed:`,
`[run-end] success`, and `Offline lifecycle verified; original usage preserved.`
Assertions check the real file tool result and the original usage totals
(20 input tokens and 10 output tokens), even though `after-model` replaces
the answer. These token counts are synthetic; no model service is contacted.
Only `README.md` is permitted, independently of the hooks.

## Native CLI callbacks

`profile.ts` declares each CLI's session-start hook; `native.ts` adds its own pre-tool hook. Claude
also demonstrates its native deny decision by refusing Bash and asking for a
file-reading tool. Other CLI hooks only print event metadata; they do not
enforce a read-only policy. No common event shape or decision format is assumed.

Prepare a Docker agent image and the selected CLI's host account login using
the [agent-image guide](../../docs/src/content/docs/guide/agent-images.md) and
[authentication guide](../../docs/src/content/docs/guide/authentication.md).
Then select one CLI:

```sh
OUTPOST_CONTAINER_IMAGE=outpost:sandbox node examples/74-lifecycle-hooks/index.ts claude
# Other choices: codex, copilot, kimi, antigravity
```

Native runs use real account credentials and model requests and may consume
paid quota. They do not load the root `.env` file. Each harness explicitly uses
`authentication: "account"`; the existing adapter copies its selected native
credentials into the private container home. The image must contain Node.js,
Git and a CLI version supporting the configured native hooks. Event emission
and ordering depend on that CLI and version. The offline run does not validate
native event firing, and the native modes have not been live-validated here.

## Files and cleanup

The shared example helper copies `repo/` to `examples/.repos/74-lifecycle-hooks/`
and initializes Git on first execution. Later executions reuse that repository.
Dispatch owns and closes its execution sandbox and removes its temporary hook
configuration; the copied demo repository remains. A hook failure fails the
turn and the script exits unsuccessfully after cleanup. Only the selected
native harness is constructed; choosing the default mode never reads account
credentials.

Guides: [CLI hooks](../../docs/src/content/docs/guide/cli-hooks.md),
[Outpost hooks](../../docs/src/content/docs/guide/harness-hooks.md),
[hooks CLI en français](../../docs/src/content/docs/fr/guide/cli-hooks.md),
[hooks Outpost en français](../../docs/src/content/docs/fr/guide/harness-hooks.md).
