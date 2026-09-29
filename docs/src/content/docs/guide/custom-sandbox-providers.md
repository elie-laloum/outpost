---
title: "Add a sandbox provider"
description: "Run agents on an execution environment Outpost does not support yet: allocate it, run commands, transfer files and release it. Outpost keeps handling Git, agents and conversations."
---

## Write a minimal provider

A `SandboxProvider` allocates one environment per sandbox and returns a `SandboxLease` that runs commands and transfers files in it. This skeleton wraps a virtual machine platform; `vms` stands for its SDK.

```ts title="vm-provider.mts"
import { randomUUID } from "node:crypto";
import {
  createRemoteSandboxProvider,
  type TransferOptions,
} from "@elie-laloum/outpost";

// Your platform's SDK.
interface Vm {
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
declare const vms: {
  create(name: string, signal?: AbortSignal): Promise<Vm>;
  remove(name: string, signal?: AbortSignal): Promise<void>;
};

const bounded = ({ signal, deadlineMs }: TransferOptions) =>
  AbortSignal.any([
    ...(signal ? [signal] : []),
    ...(deadlineMs ? [AbortSignal.timeout(deadlineMs)] : []),
  ]);

export const vmSandboxProvider = createRemoteSandboxProvider({
  name: "vm",
  async acquire(context) {
    const name = `outpost-${randomUUID()}`;
    const vm = await vms.create(name, context.signal);
    let released: Promise<void> | undefined;
    return {
      root: "/workspace",
      home: "/home/agent",
      async invoke(command) {
        const result = await vm.run(
          [command.executable, ...(command.arguments ?? [])],
          {
            cwd: command.directory ?? "/workspace",
            env: { ...context.variables, ...command.variables },
            stdin: command.stdin,
            signal: bounded(command),
            onOutput: command.observe,
          },
        );
        return {
          status: result.exitCode,
          stdout: result.stdout,
          stderr: result.stderr,
        };
      },
      upload: (source, destination, options = {}) =>
        vm.put(source, destination, bounded(options)),
      download: (source, destination, options = {}) =>
        vm.get(source, destination, bounded(options)),
      release: () => (released ??= vms.remove(name)),
    };
  },
});
```

Pass `vmSandboxProvider` as `sandboxProvider` to `dispatch()` or `createSandbox()`. Outpost calls `acquire()` once per sandbox, runs the agent and your commands through `invoke()`, then calls `release()`.

## Fill the contract

| Member                  | What Outpost expects                                                                                                              |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `name`                  | An identifier for diagnostics and resource activity.                                                                              |
| `placement`             | How the sandbox sees the checkout: `"mounted"`, `"remote"` or `"host"`. Set by the helpers below.                                 |
| `variables`             | Declarations Outpost resolves into `context.variables` ([Environment variables](../environment-variables/)).                      |
| `acquire(context)`      | Allocate the environment, honour `context.signal`, apply `context.variables` to every command and return the lease.               |
| `lease.root`            | The checkout's path inside the sandbox. Commands run there by default.                                                            |
| `lease.home`            | The agent's private home, where Outpost installs credentials and CLI settings.                                                    |
| `lease.invoke(command)` | Run `executable` with `arguments`, `stdin`, `directory` and `variables`; stream output to `observe`; return the real exit status. |
| `lease.upload()`        | Copy a host file or directory into the sandbox.                                                                                   |
| `lease.download()`      | Copy a sandbox file or directory to the host.                                                                                     |
| `lease.release()`       | Destroy the environment.                                                                                                          |

`invoke()` also receives `retain` (bytes of output tail to keep), `interactive` and `terminal` streams for [`attach()`](../sandbox-sessions/), and `input` when the lease declares `liveInput`.

## Choose mounted or remote

Both helpers take `name`, optional `variables` and `acquire`, check the name and freeze the result. They differ in the `placement` they set, which decides who moves the repository.

|                   | `createMountedSandboxProvider()`                                                 | `createRemoteSandboxProvider()`                                                                    |
| ----------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Your `acquire()`  | Mounts `context.directory` at `root` and `context.gitDirectories` so `git` works | Starts an empty environment                                                                        |
| Repository        | The agent edits the host worktree directly                                       | Outpost runs `git init` in `root`, uploads the history, then downloads and applies the new commits |
| Agent CLI         | Comes from your image                                                            | Installed in `home` when missing, unless `bootstrap: false`                                        |
| Branch            | Any [branch mode](../repository-and-branch/)                                     | `named` or `integrate`, `integrate` by default                                                     |
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

| Member                                                  | Enables                                                                                                                                    | Details                                                                                        |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| `lease.fileTransfers` (`manifest()`, `downloadBatch()`) | Remote synchronization downloads only changed files, in batches, and verifies their SHA-256.                                               | [FileTransfers](../../reference/filetransfers/)                                                |
| `lease.fileTransfers.uploadBatch()`                     | Files sent to a remote sandbox go in one batch instead of one `upload()` each.                                                             | [Cloud sandboxes](../cloud-sandboxes/)                                                         |
| `lease.liveInput: true`                                 | `invoke()` pipes `command.input` to the running process: steering reaches agents with a `liveInput` protocol, and harness MCP servers run. | [Steering](../steering/), [Add a CLI agent](../custom-agents/), [MCP servers](../mcp-servers/) |
| `provider.recover()`                                    | Durable races with `speculate()` can clean up after a crash.                                                                               | [Competing candidates](../speculation/)                                                        |

Without `liveInput`, steering a resumable CLI agent stops its process once the conversation is known and resumes it in the same sandbox.

## Survive a durable-race crash

A durable race registers each sandbox before it exists, so a restarted coordinator can remove it. In `acquire()`, await `context.registerRecovery(resourceId)` exactly once, before allocating. `recover(resourceId, { signal, deadlineMs })` then removes that resource.

```ts
import { randomUUID } from "node:crypto";
import {
  createRemoteSandboxProvider,
  type SandboxLease,
  type SandboxProvider,
} from "@elie-laloum/outpost";

// Start the VM and build its lease, as above.
declare function startVm(
  name: string,
  signal?: AbortSignal,
): Promise<SandboxLease>;
// Resolve when the VM is already gone.
declare function removeVm(name: string, signal?: AbortSignal): Promise<void>;

const provider = createRemoteSandboxProvider({
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

```ts
import { join } from "node:path";
import { diagnoseSandbox, type SandboxProvider } from "@elie-laloum/outpost";
import { repository } from "./outpost.config.mts";

declare const vmSandboxProvider: SandboxProvider;

const lease = await vmSandboxProvider.acquire({
  repository,
  directory: repository,
  gitDirectories: [join(repository, ".git")],
  variables: {},
});
try {
  const report = await diagnoseSandbox(lease, {
    transfers: true,
    sandboxProvider: vmSandboxProvider,
  });
  console.log(report.hasFailures, report.checks);
} finally {
  await lease.release();
}
```

The diagnosis leaves the lease to you: release it yourself. Then run a real `dispatch()` on a named branch; [Diagnostics](../diagnostics/) reads the report.

:::caution
Mock tests prove the protocol, not the environment. Test mounts, terminals and network restrictions against the real platform.
:::

## Limits

- **No `recover` in the helpers**: `createMountedSandboxProvider()` and `createRemoteSandboxProvider()` accept `name`, `variables` and `acquire`; add `recover` by spreading the result, as above.
- **Remote needs Git**: A remote sandbox needs `git` on its `PATH` and a writable `root`.
- **Partial transfer probe**: `transfers: true` checks one binary file. Symlinks, modes, directories and batch transfers stay unverified.

API: [SandboxProvider](../../reference/sandboxprovider/) · [SandboxLease](../../reference/sandboxlease/) · [SandboxContext](../../reference/sandboxcontext/) · [FileTransfers](../../reference/filetransfers/) · [createMountedSandboxProvider](../../reference/createmountedsandboxprovider/) · [createRemoteSandboxProvider](../../reference/createremotesandboxprovider/) · [diagnoseSandbox](../../reference/diagnosesandbox/).
