---
title: "Add a sandbox provider"
description: "Connect an execution environment that runs commands, transfers files and releases resources."
---

This guide is an adapter pattern: `sdk` represents your SDK, not a module supplied by Outpost. Implement its operations and validate them with the diagnostics below. For a first executable environment without writing an adapter, use [Docker or Podman](../containers/).

## Write a minimal provider

Implement a `SandboxProvider` to open an execution environment. It returns a `SandboxLease` through which Outpost runs commands and transfers files. The example below outlines a virtual machine integration; `vms` represents that platform’s SDK.

Adapt these SDK contracts and command helpers to your VM platform.

<!-- tabs -->

```ts title="vm.types.ts"
export interface Vm {
  run(
    argv: readonly string[],
    options: {
      cwd: string;
      env: Record<string, string>;
      stdin?: string | undefined;
      signal: AbortSignal;
      onOutput?:
        ((channel: "stdout" | "stderr", text: string) => void) | undefined;
    },
  ): Promise<{ exitCode: number; stdout: string; stderr: string }>;
  put(local: string, remote: string, signal: AbortSignal): Promise<void>;
  get(remote: string, local: string, signal: AbortSignal): Promise<void>;
}
```

```ts title="vm-sdk.types.ts"
import type { Vm } from "./vm.types.ts";

export declare const vms: {
  create(name: string, signal?: AbortSignal): Promise<Vm>;
  remove(name: string, signal?: AbortSignal): Promise<void>;
};
```

```ts title="deadline.ts"
import type { TransferOptions } from "@elie-laloum/outpost";

export const bounded = ({ signal, deadlineMs }: TransferOptions) =>
  AbortSignal.any([
    ...(signal ? [signal] : []),
    ...(deadlineMs ? [AbortSignal.timeout(deadlineMs)] : []),
  ]);
```

```ts title="command-options.ts"
import type { SandboxContext, Command } from "@elie-laloum/outpost";
import { bounded } from "./deadline.ts";

export function commandOptions(context: SandboxContext, command: Command) {
  return {
    cwd: command.directory ?? "/workspace",
    env: { ...context.variables, ...command.variables },
    stdin: command.stdin,
    signal: bounded(command),
    onOutput: command.observe,
  };
}
```

```ts title="invoke-vm.ts"
import type { Vm } from "./vm.types.ts";
import type { SandboxContext, SandboxLease } from "@elie-laloum/outpost";
import { commandOptions } from "./command-options.ts";

export function invokeVm(
  vm: Vm,
  context: SandboxContext,
): SandboxLease["invoke"] {
  return async (command) => {
    const result = await vm.run(
      [command.executable, ...(command.arguments ?? [])],
      commandOptions(context, command),
    );
    return {
      status: result.exitCode,
      stdout: result.stdout,
      stderr: result.stderr,
    };
  };
}
```

Add transfers and idempotent release, then compose the provider in `vm-provider.ts`.

<!-- tabs -->

```ts title="transfer-vm.ts"
import type { Vm } from "./vm.types.ts";
import type { SandboxLease } from "@elie-laloum/outpost";
import { bounded } from "./deadline.ts";

export function transferVm(vm: Vm): Pick<SandboxLease, "upload" | "download"> {
  return {
    upload: (source, destination, options = {}) =>
      vm.put(source, destination, bounded(options)),
    download: (source, destination, options = {}) =>
      vm.get(source, destination, bounded(options)),
  };
}
```

```ts title="vm-lease.ts"
import type { Vm } from "./vm.types.ts";
import type { SandboxLease } from "@elie-laloum/outpost";
import { transferVm } from "./transfer-vm.ts";

export function createVmLease(
  vm: Vm,
  invoke: SandboxLease["invoke"],
  remove: () => Promise<void>,
): SandboxLease {
  let released: Promise<void> | undefined;
  return {
    root: "/workspace",
    home: "/home/agent",
    invoke,
    ...transferVm(vm),
    release: () => (released ??= remove()),
  };
}
```

```ts title="vm-provider.ts"
import { createRemoteSandboxProvider } from "@elie-laloum/outpost";
import { randomUUID } from "node:crypto";
import { vms } from "./vm-sdk.types.ts";
import { createVmLease } from "./vm-lease.ts";
import { invokeVm } from "./invoke-vm.ts";

export const vmSandboxProvider = createRemoteSandboxProvider({
  name: "vm",
  async acquire(context) {
    const name = `outpost-${randomUUID()}`;
    const vm = await vms.create(name, context.signal);
    return createVmLease(vm, invokeVm(vm, context), () => vms.remove(name));
  },
});
```

Pass `vmSandboxProvider` as `sandboxProvider` to `dispatch()` or `createSandbox()`. Outpost calls `acquire()` once per sandbox, runs the agent and your commands through `invoke()`, then calls `release()`.

## Implement the operations

API reference: [SandboxLease](../../reference/sandboxlease/), [SandboxContext](../../reference/sandboxcontext/) and [FileTransfers](../../reference/filetransfers/).

`invoke()` also receives `retain` (bytes of output tail to keep), `interactive` and `terminal` streams for [`attach()`](../sandbox-sessions/), and `input` when the lease declares `liveInput`.

## Choose repository access

Both helpers take `name`, optional `variables` and `acquire`, check the name and freeze the result. They differ in the `placement` they set, which decides who moves the repository.

|                   | `createMountedSandboxProvider()`                                                 | `createRemoteSandboxProvider()`                                                                    |
| ----------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Your `acquire()`  | Mounts `context.directory` at `root` and `context.gitDirectories` so `git` works | Starts an empty environment                                                                        |
| Repository        | The agent edits the host worktree directly                                       | Outpost runs `git init` in `root`, uploads the history, then downloads and applies the new commits |
| Agent CLI         | Comes from your image                                                            | Installed in `home` when missing, unless `bootstrap: false`                                        |
| Branch            | Any [branch mode](../workspaces/)                                                | `named` or `integrate`, `integrate` by default                                                     |
| Built-in examples | Docker and Podman ([Docker and Podman](../containers/))                          | Vercel, Daytona, Firecracker ([Cloud sandboxes](../cloud-sandboxes/))                              |

## Meet the obligations

Outpost's supervision, retries and recovery rely on these behaviours. Each one is observable by a user when it breaks.

<!-- features -->

- **Exit status**: `invoke()` resolves when the process exits, with its real status, even if stdout and stderr closed earlier.
- **Cancellation**: `signal` and `deadlineMs` stop the process group and its descendants; the sandbox stays usable.
- **Transfer limits**: `upload()` and `download()` honour `signal` and `deadlineMs` too.
- **Exact bytes**: Transfers copy binary data without text decoding and keep supported modes and symlinks.
- **Safe staging**: Reject destinations that escape their target; remove temporary staging on success, failure and cancellation.
- **Idempotent release**: A second `release()` resolves without error.

:::caution
A container provider must transfer through a process inside the container, for example a streamed `tar`. `docker cp` does not see tmpfs and other live mounts.
:::

## Declare optional capabilities

Outpost uses a capability only when the provider or lease declares it; it never infers one from the provider's name.

API reference: [SandboxLease](../../reference/sandboxlease/).

Without `liveInput`, steering a resumable CLI agent stops its process once the conversation is known and resumes it in the same sandbox.

## Prepare recovery after a crash

A durable race registers each sandbox before it exists, so a restarted coordinator can remove it. In `acquire()`, await `context.registerRecovery(resourceId)` exactly once, before allocating. `recover(resourceId, { signal, deadlineMs })` then removes that resource.

<!-- tabs -->

```ts title="vm-lifecycle.types.ts"
import type { SandboxLease } from "@elie-laloum/outpost";

export declare function startVm(
  name: string,
  signal?: AbortSignal,
): Promise<SandboxLease>;
export declare function removeVm(
  name: string,
  signal?: AbortSignal,
): Promise<void>;
```

```ts title="durable-vm.ts"
import { createRemoteSandboxProvider } from "@elie-laloum/outpost";
import { randomUUID } from "node:crypto";
import { startVm, removeVm } from "./vm-lifecycle.types.ts";
import type { SandboxProvider } from "@elie-laloum/outpost";

export const provider = createRemoteSandboxProvider({
  name: "vm",
  async acquire(context) {
    const name = `outpost-${randomUUID()}`;
    await context.registerRecovery?.(name);
    return startVm(name, context.signal);
  },
});
export const durableVmProvider: SandboxProvider = {
  ...provider,
  recover: (resourceId, options) => removeVm(resourceId, options?.signal),
};
```

`registerRecovery` exists only during a durable race. If it rejects, do not allocate. `recover()` must succeed when called again and delete only the sandbox, never repository data on the host.

## Test against the real environment

`diagnoseSandbox()` probes a lease: Node.js, Git, separate output streams, a nonzero exit status, the home directory and, with `transfers`, a binary upload verified by a process in the sandbox.

<!-- tabs -->

```ts title="diagnostic-lease.ts"
import type { SandboxProvider } from "@elie-laloum/outpost";
import { repository } from "./outpost.config.ts";
import { join } from "node:path";

export declare const vmSandboxProvider: SandboxProvider;
export function openDiagnosticLease() {
  return vmSandboxProvider.acquire({
    repository,
    directory: repository,
    gitDirectories: [join(repository, ".git")],
    variables: {},
  });
}
```

```ts title="diagnose.ts"
import { openDiagnosticLease, vmSandboxProvider } from "./diagnostic-lease.ts";
import { diagnoseSandbox } from "@elie-laloum/outpost";

export const lease = await openDiagnosticLease();
try {
  const report = await diagnoseSandbox(lease, {
    transfers: true,
    sandboxProvider: vmSandboxProvider,
  });
  console.log(report.hasFailures, report.checks);
  // Example output: false [ { id: "sandbox.node", status: "pass", … }, … ]
} finally {
  await lease.release();
}
```

The diagnosis leaves the lease to you: release it yourself. Then run a real `dispatch()` on a named branch; [Diagnostics](../diagnostics/) reads the report.

:::caution
Mock tests prove the protocol, not the environment. Test mounts, terminals and network restrictions against the real platform.
:::

## File workspaces

The optional `SandboxProvider.workspaces` capability declares supported file bindings and acquires from `FileSandboxContext`. Legacy providers keep `acquire(SandboxContext)` for Git. Missing file capabilities are refused before allocation. See [file workspaces](../workspaces/).

## Limits

- **No `recover` in the helpers**: `createMountedSandboxProvider()` and `createRemoteSandboxProvider()` accept `name`, `variables` and `acquire`; add `recover` by spreading the result, as above.
- **Remote needs Git**: A remote sandbox needs `git` on its `PATH` and a writable `root`.
- **Partial transfer probe**: `transfers: true` checks one binary file. Symlinks, modes, directories and batch transfers stay unverified.

API: [SandboxProvider](../../reference/sandboxprovider/) · [SandboxLease](../../reference/sandboxlease/) · [SandboxContext](../../reference/sandboxcontext/) · [FileTransfers](../../reference/filetransfers/) · [createMountedSandboxProvider](../../reference/createmountedsandboxprovider/) · [createRemoteSandboxProvider](../../reference/createremotesandboxprovider/) · [diagnoseSandbox](../../reference/diagnosesandbox/).
