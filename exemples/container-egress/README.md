# Docker and Podman egress

Run from this repository with Node.js 24+ and the chosen engine. No model credentials or paid API calls are used. This example contacts `example.com` and Cloudflare's public `1.1.1.1` endpoint, so it requires Internet connectivity.

```sh
bun install --frozen-lockfile
bun run build
docker build -t outpost-egress:dev -f images/egress/Dockerfile .
docker pull docker.io/library/node:24-slim
node exemples/container-egress/run.ts docker
```

For Podman, replace the two Docker commands with Podman and pass `podman` to the script. `OUTPOST_CONTAINER_IMAGE` and `OUTPOST_EGRESS_IMAGE` override the image references. The companion's first public default image has not yet been published, so this source example selects the local build explicitly.

Expected output: an HTTP success status for `example.com`, a refused unlisted HTTPS destination, and a successful raw TCP connection to the allowed CIDR. The ephemeral workspace, sandbox and companion close automatically. The CIDR also permits UDP to that address; the deterministic container regression checks UDP echo and blocked traffic without relying on a public DNS service.

Read the [English network guide](../../docs/src/content/docs/guide/network-restrictions.md), [French network guide](../../docs/src/content/docs/fr/guide/network-restrictions.md) and [image publication procedure](../../images/egress/README.md) for policy semantics, failure behavior and remaining live-validation prerequisites.
