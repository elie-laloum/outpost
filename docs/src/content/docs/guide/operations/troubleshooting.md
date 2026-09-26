---
title: "Troubleshooting"
description: "Troubleshooting — Outpost"
sidebar:
  order: 2
---

Start with the error code, operation log and retained workspace path. Change one configuration at a time so the result remains diagnosable.

Use [host diagnostics](../doctor/) to check prerequisites before investigating an execution failure.

| Symptom                                                     | Check / next action                                                                                                                                                 |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Image not found                                             | Build with the same engine and image tag configured in the provider.                                                                                                |
| UID mismatch or unwritable mount                            | Align build/runtime UID/GID; check host permissions, Podman namespace and SELinux label.                                                                            |
| Podman unavailable on macOS                                 | Start Podman Machine and confirm the host CLI can reach it.                                                                                                         |
| Agent authentication fails                                  | Check the harness `authentication` form, its declared variable or host file and the plan/API access; see [authentication](../../manual/authentication/).            |
| `Missing NAME. Declare the selected credential explicitly.` | Declare that variable in `.outpost/.env`, the workflow `.env` or provider/harness `variables`; a host variable alone is not forwarded.                              |
| `Account credentials were not found at …`                   | Run the login command named in the error on the host with file storage, point `account.file` at the file, or use a token or `usage` form. Keychains are never read. |
| `… does not support … authentication`                       | Choose one of the accepted forms listed in the message; the agent was not composed.                                                                                 |
| `Conflicting Claude authentication`                         | Remove `ANTHROPIC_API_KEY` for an account form, or `CLAUDE_CODE_OAUTH_TOKEN` for a usage form.                                                                      |
| Host CLI logged out after a run                             | The sandbox copy rotated the refresh token. Sign in again and give Outpost a dedicated profile through `account.file`.                                              |
| Cloud allocation succeeds, agent fails                      | Provider and model credentials are independent; inspect agent stderr.                                                                                               |
| CLI rejects a flag                                          | Compare installed CLIs with `agentVersions`; rebuild stale images.                                                                                                  |
| No output, then timeout                                     | Check credentials, network, agent logs and `idleMs`/`deadlineMs`; do not only increase the limits.                                                                  |
| Brief variable missing                                      | Supply `values`, fix the placeholder, or use interactive `ask`.                                                                                                     |
| Resume cannot find transcript                               | Check agent, conversation ID, `conversationHome` and successful prior capture.                                                                                      |
| Operation already active                                    | Serialize work on that sandbox or allocate separate sandboxes.                                                                                                      |
| Branch checked out elsewhere                                | Use that workspace deliberately or choose a different branch; do not move it behind Git’s back.                                                                     |
| Host changed during remote execution                        | Preserve recovery material and reconcile host/incoming changes separately.                                                                                          |
| Workflow waits after cancellation                           | Custom callbacks/providers must honor their AbortSignal and finish cleanup.                                                                                         |
| Init refuses to overwrite files                             | Edit the existing scaffold or choose another project directory.                                                                                                     |

For reports, include OS, Node/Outpost/provider/agent versions, sanitized error code and the smallest reproducible configuration. Strip credentials, private prompts and source from shared logs. See [recovery](../recovery/) for retained data and [security](../security/) for private reporting.
