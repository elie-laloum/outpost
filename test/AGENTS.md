# Tests

Read this brief before changing `test/` or choosing which suites to run. The root `AGENTS.md` keeps the test conventions, coverage rule and validation commands.

## Suites

- `test/unit/`: domain rules, protocol adapters, boundaries and isolated infrastructure behavior.
- `test/functional/`: lifecycle, Git, synchronization, recovery, CLI and workflow behavior using temporary resources.
- `test/redis.test.ts`: real standalone Redis 7/8 queue behavior, including concurrent claims, stale leases, cancellation and interrupted publication/finalization. Run with `bun run test:redis`; `OUTPOST_REDIS_PORT` selects a dedicated local test server.
- `test/container.test.ts` and `test/session-bundles-container.test.ts`: real Docker/Podman behavior. Mocks alone cannot validate process sessions, tmpfs, mounts, ownership or archive transfer.
- `test/editor-browser.test.ts`: the built recipe editor driven in headless Chromium through `outpost recipe editor`: a canvas edit saved with its comments and layout, and a durable run approved at its gate. Run `bun run build`, then `bun run test:editor`; it uses only the local provider and no credentials.
- `test/fixtures/container-terminal.ts`: real PTY input, exit status, cancellation and warm reuse.
- `test/fixtures/lease-contract.ts`: ordered sandbox lease checks (exit status after closed outputs, exact output, cancellation and reuse, transfers verified inside the sandbox) shared by the local, Docker/Podman and live cloud runs. `defineLeaseContractSuite()` registers them for a provider and adds idempotent release.
- `test/fixtures/workspace-contract.ts`: workspace checks shared by Git (current and named) and file (directory copy and ephemeral) workspaces: exit status after closed outputs, cancellation and reuse, one lent sandbox at a time, idempotent close and preservation. `defineWorkspaceContractSuite()` registers them for the local provider and for real Docker/Podman runs; add new workspace kinds to `workspaceContractTargets()`.
- Live checks are opt-in and require their documented credentials or runtime: `test/cli-continuations-native.test.ts`, `test/firecracker-live.test.ts`, `test/firecracker-jailer-live.test.ts`, `test/cloud-live.ts`, and `scripts/harness-live.mjs`. Inspect their prerequisites before running; offline mocks do not substitute for these checks.
- `scripts/package-smoke.mjs`: the packed package as a consumer sees it, including exports and declarations.
