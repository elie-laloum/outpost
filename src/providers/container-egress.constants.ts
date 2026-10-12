export const defaultEgressImage: string | undefined =
  "ghcr.io/elie-laloum/outpost/egress@sha256:f56c1272514e65a3a65d7663c5f9c025abad11278577c36d5d699010dc8713a8";

export const containerEgress = Object.freeze({
  label: "io.outpost.egress.owner",
  entrypoint: "/opt/outpost/providers/egress/main.js",
  startupMs: 15_000,
  pollMs: 100,
});
