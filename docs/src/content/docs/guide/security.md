---
title: "Security"
description: "Understand what your execution environment exposes."
---

Coding agents execute project commands. Choose the repository, credentials, mounts and network access as deliberately as you would for any program running that code.

## Filesystem access

Docker and Podman mount the checkout and writable Git metadata by default. This is not an adversarial boundary protecting the host repository from an agent. The [private Git mode](../private-git/) avoids those mounts, while local execution provides no isolation.

Extra devices, host volumes and shared caches expand access. A read-only mount still exposes its contents. An agent can read credentials passed into its environment.

## Credentials and data

Outpost reads only selected CLI credential files and never a system keychain. Isolated copies use private directories and files. Do not bake secrets into images or tracked scripts. Cloud providers receive repository history and selected inputs; transports receive the objects configured for persistence.

[MCP servers](../mcp-servers/) act with the agent’s authority and receive the variables you name. Outpost writes only variable references in their configuration. With the local provider, Kimi and Antigravity entries are merged into your own home. An [MCP login](../mcp-oauth/) copied into a sandbox can rotate the refresh token and invalidate the host login.

## Application authority

An approval actor, artifact producer and recorded remote PID are metadata. Your application authenticates users, authorizes publication and determines whether a remote owner has actually stopped. Hashes and conditional writes protect integrity and concurrency; they do not establish identity. Likewise, whoever can write a [task cache](../task-cache/) transport controls the results that cached tasks restore.

Use [outbound rules](../network-restrictions/) when supported, but verify the chosen provider’s capability before treating a policy as enforced.
