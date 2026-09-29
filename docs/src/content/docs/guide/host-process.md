---
title: "Host process"
description: "Run deliberately without sandbox isolation."
---

`createLocalSandboxProvider()` executes directly on the host. Use it for trusted code when you intentionally want access to the host’s tools and filesystem.

```ts
import { createLocalSandboxProvider } from "@elie-laloum/outpost/providers/local";

const sandboxProvider = createLocalSandboxProvider();
```

Install the selected agent CLI and project dependencies yourself. The provider does not create container isolation or protect host credentials from executed project code.

Account authentication uses the CLI’s existing host session. Outpost supplies credential variables but does not install credential files onto the host.

Workspace branch policies and workflow orchestration still apply. Choose [Docker](../docker/) or [Podman](../podman/) when execution should occur inside a container.

API: [createLocalSandboxProvider](../../reference/createlocalsandboxprovider/).
