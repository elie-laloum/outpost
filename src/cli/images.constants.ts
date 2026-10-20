export const imageRegistry = "ghcr.io/elie-laloum/outpost";
export const imageBase =
  "node:24-bookworm-slim@sha256:a5f4366e834695d5f363b920c104953a535d3a9864d1bdf74566a0ebe01daee5";
export const imageSource = "https://github.com/elie-laloum/outpost";
export const imageAttestation = Object.freeze({
  repository: "elie-laloum/outpost",
  workflow: "elie-laloum/outpost/.github/workflows/images.yml",
});
export const imageSystemPackages = Object.freeze([
  "git",
  "openssh-client",
  "ca-certificates",
  "procps",
  "util-linux",
]);
export const harnessImage = Object.freeze({
  name: "harness",
  description:
    "Built-in Outpost harness: Node.js, Git and a shell, no agent CLI",
});
/** Verified multi-architecture digests, written by scripts/record-images.mjs. */
export const publishedImages: Readonly<Record<string, string>> = Object.freeze(
  {},
);
export const imageDefaults = Object.freeze({
  uid: 1000,
  gid: 1000,
  buildMs: 1_800_000,
  pullMs: 600_000,
  verifyMs: 120_000,
});
export const imageFiles = Object.freeze({
  docker: "Dockerfile",
  podman: "Containerfile",
});
