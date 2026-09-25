---
title: "Troubleshooting"
description: "Troubleshooting — Outpost"
sidebar:
  order: 2
---

Start with the error code, operation log and retained workspace path. Change one configuration at a time so the result remains diagnosable.

Use [host diagnostics](../../../../guide/operations/doctor/) to check prerequisites before investigating an execution failure.

| Symptom                                | Check / next action                                                                                |
| -------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Image not found                        | Build with the same engine and image tag configured in the provider.                               |
| UID mismatch or unwritable mount       | Align build/runtime UID/GID; check host permissions, Podman namespace and SELinux label.           |
| Podman unavailable on macOS            | Start Podman Machine and confirm the host CLI can reach it.                                        |
| Agent authentication fails             | Verify declared API/OAuth variables or explicitly mounted native authentication files.             |
| Cloud allocation succeeds, agent fails | Provider and model credentials are independent; inspect agent stderr.                              |
| CLI rejects a flag                     | Compare installed CLIs with `agentVersions`; rebuild stale images.                                 |
| No output, then timeout                | Check credentials, network, agent logs and `idleMs`/`deadlineMs`; do not only increase the limits. |
| Brief variable missing                 | Supply `values`, fix the placeholder, or use interactive `ask`.                                    |
| Resume cannot find transcript          | Check agent, conversation ID, `conversationHome` and successful prior capture.                     |
| Operation already active               | Serialize work on that sandbox or allocate separate sandboxes.                                     |
| Branch checked out elsewhere           | Use that workspace deliberately or choose a different branch; do not move it behind Git’s back.    |
| Host changed during remote execution   | Preserve recovery material and reconcile host/incoming changes separately.                         |
| Workflow waits after cancellation      | Custom callbacks/providers must honor their AbortSignal and finish cleanup.                        |
| Init refuses to overwrite files        | Edit the existing scaffold or choose another project directory.                                    |

For reports, include OS, Node/Outpost/provider/agent versions, sanitized error code and the smallest reproducible configuration. Strip credentials, private prompts and source from shared logs. See [recovery](../../../../guide/operations/recovery/) for retained data and [security](../../../../guide/operations/security/) for private reporting.
