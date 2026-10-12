export const defaultEgressImage: string | undefined = undefined;

export const containerEgress = Object.freeze({
  label: "io.outpost.egress.owner",
  entrypoint: "/opt/outpost/providers/egress/main.js",
  startupMs: 15_000,
  pollMs: 100,
});
