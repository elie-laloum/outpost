# Outpost egress companion

This image runs a dedicated HTTP/HTTPS proxy and an nftables firewall in the network namespace shared with one sandbox. Its privileged supervisor owns the firewall; the proxy drops to UID 65532. The sandbox has neither `NET_ADMIN` nor `SETUID`, receives no companion filesystem mount and cannot become the proxy user. The kernel expires external permissions within three seconds of a lost supervisor heartbeat. Loopback services remain reachable.

Build from the repository root with Node.js 24+:

```sh
bun install --frozen-lockfile
bun run build
docker build -t outpost-egress:dev -f images/egress/Dockerfile .
docker pull docker.io/library/node:24-slim
OUTPOST_CONTAINER_ENGINE=docker OUTPOST_EGRESS_IMAGE=outpost-egress:dev node --test test/container-egress.test.ts
```

Use the corresponding Podman commands and `OUTPOST_CONTAINER_ENGINE=podman` to exercise rootless Podman. The engine must support a bridge network, shared network/user namespaces and nftables inside that namespace. Outpost does not edit the host firewall or elevate the host process. The publication workflow validates Docker and rootless Podman on GitHub-hosted Linux amd64/arm64 runners. Additional tests in a privileged outer container exercise rootless Docker and Podman. Native macOS/Windows VMs, standalone rootless Docker hosts and native IPv6 connectivity still require live validation.

Omitting `egressImage` uses the public Linux amd64/arm64 image pinned in `src/providers/container-egress.constants.ts`; the engine downloads it when absent. The [first publication](https://github.com/elie-laloum/outpost/actions/runs/38321177589) passed Docker and Podman validation on both architectures and verified its provenance. Set `egressImage: "outpost-egress:dev"` to test a local build. The `egressImage` override must be trusted and should use a digest in production. It implements the runtime at `/opt/outpost/providers/egress/main.js`, receives `OUTPOST_EGRESS_POLICY`, and exposes the matching `health` command. Runtime changes require a fresh image and renewed validation.

## Publish and register a default

The `Egress image` workflow builds and tests on Docker and Podman, on Linux amd64 and arm64 runners. Publication is explicit: enable `OUTPOST_EGRESS_IMAGE_PUBLISH`, configure the protected `egress-image` environment, and dispatch with `publish: true`. It publishes tested image bytes to `ghcr.io/elie-laloum/outpost/egress`, attests the digest and verifies the attestation. Ensure the package is public so ordinary consumers can pull it without registry credentials.

After reviewing the workflow result, run its `node scripts/record-egress-image.mjs ghcr.io/elie-laloum/outpost/egress@sha256:...` instruction. Commit the actual verified digest before publishing Outpost. Do not invent a digest or label a local build as published. Publication assembles the two tested architectures into a manifest list. Verify the attestation and anonymous image availability before registering each new default. Source builds target the local architecture.

The companion image has no agent credentials or workspace. Explicitly mounted host sockets or devices can introduce separate capabilities outside the network policy. HTTPS inspection checks the TLS server name, not encrypted HTTP headers; permitted services and shared infrastructure can still receive data.
