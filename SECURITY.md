# Security boundaries

Outpost runs coding agents that execute arbitrary project commands. Use it with repositories and credentials appropriate for that task.

Docker/Podman expose only the selected checkout, Git metadata and explicit volumes. The Docker socket is not mounted by default. Containers use a chosen UID/GID, dropped capabilities, no-new-privileges and a private home. Extra devices, writable mounts and elevated hooks expand the boundary deliberately.

Shared Git metadata is writable by the agent. A mounted sandbox is not an adversarial boundary protecting the host repository or its configuration. Outpost disables host Git hooks for its own Git commands, but a malicious repository can contain other executable configuration or project tooling. Do not run untrusted repositories with valuable host credentials. Host `local()` provides no isolation.

Remote providers upload repository history and inputs to the selected cloud account. Explicit credentials and environment files are sent to that environment. Review the cloud provider's own storage/network policy. Concurrent host changes stop synchronization; recovery files preserve prior and incoming state when available.

Prompt command expansion only recognizes commands present in the original prompt file. Substitution cannot introduce new expansion fragments. Values substituted inside an original shell command still have shell semantics and must be trusted or quoted by the prompt author.

Conversation transcripts, logs, bundles and patches may contain secrets. Runtime files are ignored by Git and sensitive files are created with restrictive permissions where supported. Keep API keys in environment variables or ignored `.env` files. Never embed tokens in tracked configuration, remote URLs or examples.

Report vulnerabilities privately using the repository's security reporting channel when enabled, or contact the maintainer through the hosting profile. Do not include live credentials in reports. V1 receives fixes for reproducible security defects.
