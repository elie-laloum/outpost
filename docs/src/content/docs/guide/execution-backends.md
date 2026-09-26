---
title: "Execution backends"
description: "Choose where agent commands run."
---

A sandbox provider allocates an environment, runs commands, transfers files and releases resources. Choose it independently of the agent harness.

| Backend                              | Repository access                     | Interactive terminal | Setup                              |
| ------------------------------------ | ------------------------------------- | -------------------- | ---------------------------------- |
| [Docker](../docker/)                 | Host mounts by default                | Yes                  | Docker engine and image            |
| [Podman](../podman/)                 | Host mounts by default                | Yes                  | Podman engine and image            |
| [Host process](../host-process/)     | Direct host filesystem                | Yes                  | Installed tools; no isolation      |
| [Vercel Sandbox](../vercel-cloud/)   | Uploaded snapshot and synchronization | No                   | Optional SDK and cloud credentials |
| [Daytona Sandbox](../daytona-cloud/) | Uploaded snapshot and synchronization | Yes                  | Optional SDK and cloud credentials |
| [Firecracker VM](../microvms/)       | Private guest environment             | Capability-dependent | Experimental Linux/KVM setup       |

## Choose by ownership

Use a container when the runtime should be repeatable on a local machine or CI runner. Use a cloud provider to allocate away from the host. Use local execution only when host access is intentional.

Container mounts expose the selected checkout and Git metadata. [Private Git isolation](../private-git/) is an opt-in alternative with different synchronization behavior.

Cloud synchronization stops when concurrent host edits would be overwritten. Outpost preserves recovery data rather than silently choosing one side. See [File exchange](../file-exchange/).

API: [SandboxProvider](../../reference/sandboxprovider/).
