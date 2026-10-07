# Repetition watchdog

From the repository root with Node.js 24+ and installed dependencies:

```sh
bun run build
node examples/58-repetition-watchdog/index.ts
```

The offline model repeats `git status --short` through real shell tools in an
explicitly unisolated local sandbox on a demo repository. No credentials,
container or paid model calls are required. It runs three independent dispatches:

- `stop` rejects with `OutpostError` code `stuck` before the third tool executes.
- `warn` emits a warning and lets the model finish polling.
- An instruction changes the model's approach through built-in harness steering.

Each run prints its `stuck` action and count and asserts its observable outcome.
The sandbox closes after each dispatch; this example makes no changes or commits.
Reruns reuse `examples/.repos/58-repetition-watchdog`.

The detector matches decoded activity, not actual Git progress. The sample model
responds deterministically to the instruction; a native CLI may instead need
conversation resume, and live CLI/cloud validation remains pending. The default
instruction allowance is one; another repetition episode then stops with `stuck`.
