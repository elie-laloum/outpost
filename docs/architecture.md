# Architecture

Outpost separates domain contracts from orchestration and infrastructure.

| Layer                | Responsibility                                                                                                          |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `src/domain`         | Workspace policy, command/agent/provider ports, prompts, responses, workflow graph, issue/backlog contracts and errors. |
| `src/application`    | Resource ownership, dispatch coordination, workflow task helpers, issue campaigns and remote synchronization.           |
| `src/infrastructure` | Git, filesystem, native transcripts, process supervision, journals and shutdown cleanup.                                |
| `src/providers`      | Claude/Codex protocols and Docker/Podman/host/Vercel/Daytona backends.                                                  |
| `src/cli`            | Onboarding, starter templates and image lifecycle.                                                                      |

The main boundaries are `AgentAdapter`, `ConversationStore`, `SandboxProvider`, `SandboxLease` and `Backlog`. An agent converts typed input into a command and normalizes protocol events. A provider owns allocation and release. The application owns synchronization and recovery. Cloud SDKs are optional imports isolated in their provider modules.

Workspaces and sandboxes have distinct ownership. A separately acquired workspace can be passed through several agent environments. Promise-based exclusive operations avoid hidden queues or accidental overlap in one sandbox. Git lock files extend that protection across processes; stale process locks can be recovered.

Workflows operate on typed task results rather than a global mutable context. Task identity determines value access. Results belong to one execution and cannot leak into a later run. Observer failures are separated from business outcomes.

Prompt parsing records command fragments before substituting variables. This preserves command provenance. Native transcripts rewrite only structural `cwd` fields matching the source workspace without performing global string replacement on user messages. Remote transport preserves Git history instead of manufacturing new commits from a patch.

Tests combine domain unit tests, deterministic provider contracts, real subprocess/Git functional tests and real container tests in CI. Tests requiring paid remote infrastructure are opt-in. Package smoke tests exercise the actual tarball outside the source checkout.
