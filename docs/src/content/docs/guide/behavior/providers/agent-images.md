---
title: Prebuilt agent images
description: Build pinned agent images and verify signed provenance before use.
sidebar:
  order: 4
---

Outpost includes a build workflow for a combined Claude Code/Codex/Gemini container image. Its agent versions come from the same pins as generated workflow projects. The workflow and verification procedure are available; this page does not assert that a public image or signed attestation has been published. Use only a digest from a successful, verified publication run.

## Build locally

From an Outpost source checkout with Node.js 24+, choose a reviewed digest for `node:24-bookworm-slim` and a Debian snapshot timestamp. The preparation script requires both; mutable base tags are rejected.

```sh
node scripts/prepare-agent-image.mjs /tmp/outpost-agent-build \
  "node:24-bookworm-slim@sha256:REVIEWED_BASE_DIGEST" \
  20260923T000000Z
docker build --build-arg AGENT_UID="$(id -u)" \
  --build-arg AGENT_GID="$(id -g)" \
  --tag outpost-agents:local /tmp/outpost-agent-build
```

Replace `REVIEWED_BASE_DIGEST` with 64 hexadecimal characters. Podman accepts the same generated Dockerfile and build arguments. The context contains only the recipe and package manifests; repository files, credentials and transcripts are excluded.

The context reuses the existing packages, non-root user and private home recipe, adding a digest-pinned base, dated Debian package repositories and `npm ci` against `images/agents/package-lock.json`. Agent dependencies are installed under `/opt/outpost/agents`, outside the ephemeral home. All three CLI binaries are on `PATH`. The generator fails when the image manifest no longer matches the supported-agent versions. Update both the manifest and its lockfile when updating those pins:

```sh
npm install --package-lock-only --ignore-scripts --prefix images/agents
```

Record the source commit, base digest, snapshot, architecture, UID/GID and resulting image digest. These inputs make dependency resolution repeatable; build timestamps and tool behavior can still prevent byte-for-byte identical images. A pinned snapshot intentionally stops receiving new security packages until you review and update it. The local build is unsigned.

## Publish with signed provenance

The dedicated `.github/workflows/agent-images.yml` workflow is manual and restricted to `main`. Its default is build-only. It runs the project checks, builds for the Linux runner's native architecture, and runs real Docker and PTY tests before saving the tested image and exact build context as workflow artifacts. It uses the runner's UID/GID and retains artifacts for seven days. It does not publish multi-architecture manifests or cloud-provider images.

Before enabling publication, maintainers must configure the `agent-images` GitHub environment with required reviewers and allow only `main`, then set repository variable `OUTPOST_AGENT_IMAGES_PUBLISH=true`. Dispatch with `publish=true` to enable the separate environment-gated publication job. Repository environment protection is hosting configuration and is not created by this workflow. Synchronize workflow changes from canonical GitLab before dispatching on the GitHub mirror.

The job publishes the tested archive under a unique commit/run/attempt tag, creates a signed SLSA provenance attestation for the registry digest, and verifies that digest against the repository, source commit and this workflow. It emits the verified digest and source commit only after verification succeeds, then retains the JSON verification result as the `agent-image-verification` workflow artifact for fourteen days. Download this result alongside the build inputs before artifact expiry; it records the verified attestation, including the image digest and source identity. A build-only or skipped publication job provides no signed publication evidence. A failed push, attestation or verification leaves the run unsuccessful; a registry tag alone is not evidence of signed publication. No `latest` tag or package release is created. GitHub supplies the short-lived signing identity through OIDC; no private signing key belongs in the repository. See [GitHub artifact attestations](https://docs.github.com/en/actions/how-tos/secure-your-work/use-artifact-attestations/use-artifact-attestations) and the [attest action](https://github.com/actions/attest).

## Verify before pulling and running

Use the exact digest and source commit from the successful workflow. Replace all placeholders below, including the publishing repository when using a fork.

```sh
IMAGE='ghcr.io/elie-laloum/outpost/agents@sha256:VERIFIED_IMAGE_DIGEST'
COMMIT='FULL_SOURCE_COMMIT'
gh attestation verify "oci://$IMAGE" \
  --repo elie-laloum/outpost \
  --signer-workflow elie-laloum/outpost/.github/workflows/agent-images.yml \
  --source-ref refs/heads/main --source-digest "$COMMIT" &&
  docker pull "$IMAGE"
docker image inspect --format '{{.Config.User}}' "$IMAGE"
```

Stop if verification fails. `gh attestation verify` validates the signed identity and digest; it does not prove that the image is free of vulnerabilities. Its constraints are documented in the [GitHub CLI manual](https://cli.github.com/manual/gh_attestation_verify). Podman users run the same verification and then `podman pull` with the digest.

Pass that full digest reference as the provider's `image`. Container preflight expects the image UID to match the host unless `user` is explicit. When they differ, explicitly set `user: { uid: hostUid, gid: hostGid }`, or rebuild for your host. Ensure this user can access your mounted checkout. Outpost supplies the writable private tmpfs home for that user; do not persist the image home to work around permissions. Normal [container authentication and configuration](../../../environment/providers/containers/) still apply.

Digest verification and pulling are explicit operator steps. Outpost does not automatically fetch images or verify their attestations. Combine a verified image with [dependency caches](../../../environment/providers/dependency-caches/) for repeated runs.
