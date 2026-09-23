# Sandbox providers

| Provider       | Placement     | Terminal | File transfer     | Requirement                           |
| -------------- | ------------- | -------- | ----------------- | ------------------------------------- |
| Docker         | Mounted       | Yes      | Files/directories | Running Docker daemon                 |
| Podman         | Mounted       | Yes      | Files/directories | Running Podman engine                 |
| Host `local()` | Host checkout | Yes      | Files/directories | Native agent installed                |
| Vercel         | Remote        | No       | Files/directories | `@vercel/sandbox`, Vercel credentials |
| Daytona        | Remote        | No       | Files/directories | `@daytona/sdk`, Daytona credentials   |

## Docker and Podman

```ts
import { docker } from "@elie-laloum/outpost/providers/docker";

const provider = docker({
  image: "outpost:my-repository",
  user: { uid: 1000, gid: 1000 },
  volumes: [
    {
      source: "~/.config/example",
      target: "/home/agent/.config/example",
      readOnly: true,
    },
  ],
  networks: ["development"],
  groups: [1000],
  devices: [],
  cpus: 2,
  memoryMb: 4096,
  label: "z",
  retain: 65_536,
  variables: {},
});
```

`podman()` accepts the same options. Default image is `outpost:<normalized-repository-directory>`. Build it with the CLI. Default UID/GID match the host on POSIX and use 1000 on Windows. The image preflight reports numeric UID mismatches. Mount sources support `~`, relative and absolute paths, and files. Relative targets resolve under `/workspace`. Linux mounts use SELinux `z` by default; choose `Z` for a private label or `false` to omit labels. Windows/macOS use bind-mount syntax.

Containers have a private ephemeral home, dropped capabilities, no-new-privileges and an init process. Only selected mounts and Git metadata are exposed. Git paths are remapped so Windows worktree pointers remain usable inside Linux. Credentials are passed through environment names rather than command-line values. A command-specific process group allows cancellation without destroying the warm environment.

The generated image contains Git, Node.js, Python, shell utilities and both agent CLIs. Modify the Dockerfile/Containerfile to install project tools. `outpost image build --file custom.Dockerfile --image custom:tag --uid 1000 --gid 1000` selects an alternative recipe. `outpost image remove` removes only the selected image.

## Explicit host execution

```ts
import { local } from "@elie-laloum/outpost/providers/local";
const result = await dispatch({
  agent: codex(),
  provider: local(),
  brief: { text: "Inspect the project." },
});
```

This is unisolated execution using your OS account and environment. Install/authenticate the CLI on the host. Outpost never silently falls back to host execution if a container fails. The host adapter does not elevate privileges.

## Vercel

```sh
npm install @vercel/sandbox
```

```ts
import { vercel } from "@elie-laloum/outpost/providers/vercel";

const provider = vercel({
  create: { timeout: 30 * 60 * 1000 },
  variables: { OPENAI_API_KEY: process.env.OPENAI_API_KEY! },
});
```

`create` accepts the installed SDK's sandbox-creation options, including credentials, runtime/image, networking and resources. Credential discovery follows the SDK. `root` can override the remote workspace directory; `retain` controls captured output tails. The provider discovers the actual remote home. Outpost installs the chosen agent in a user-writable prefix if it is missing; set `bootstrap: false` on `createSandbox`/`dispatch` when managing tools yourself.

## Daytona

```sh
npm install @daytona/sdk
```

```ts
import { daytona } from "@elie-laloum/outpost/providers/daytona";

const provider = daytona({
  connection: { apiKey: process.env.DAYTONA_API_KEY },
  create: { language: "typescript" },
});
```

`connection` is the SDK client configuration. `create` accepts an image/snapshot sandbox configuration. The remote environment must provide Node.js, npm, Git, `sh` and `setsid`. `root`, `variables`, and `retain` are available. Native process sessions stream both output channels and are cleaned up after each invocation. Cancellation terminates only the command process group.

## Remote Git transport

Remote workspaces are initialized from a Git bundle, then receive the host's tracked patch and untracked files. Selected copied inputs are uploaded too. Each dispatch, command or terminal completion synchronizes back. New commits retain their object IDs, authors, timestamps and parent relationships. Repeated synchronization handles uncommitted work later becoming committed without duplicating commits.

Outpost compares host state with its last synchronized state. Concurrent local edits cause a recovery error. Before applying remote changes it saves patches, untracked files and incoming commits in `.outpost/recovery`. Rewritten/non-fast-forward remote history is rejected. Relative transfer paths are validated, and local symlink-parent traversal is rejected.

## Custom providers

`mountedProvider({ name, variables?, acquire })` and `remoteProvider({ name, variables?, acquire })` wrap your own backend. `acquire(context)` receives repository/workspace paths, Git metadata directories, resolved variables and a signal. Return a `SandboxLease`:

```ts
interface SandboxLease {
  root: string;
  home: string;
  invoke(command: Command): Promise<CommandResult>;
  upload(source: string, destination: string): Promise<void>;
  download(source: string, destination: string): Promise<void>;
  release(): Promise<void>;
}
```

`invoke` must stream output to `observe`, respect abort/deadline, and leave the lease reusable after cancellation. `release` must be idempotent. Remote providers must support Git and file transfer; Outpost performs synchronization through those capabilities. Interactive support is optional but unsupported calls must fail clearly. Cloud factories also accept an optional connection factory for contract tests or custom SDK wiring.
