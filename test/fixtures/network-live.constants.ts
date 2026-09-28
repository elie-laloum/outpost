import type { NetworkProbe, NetworkScenario } from "./network-live.types.ts";

export const networkProbes: readonly NetworkProbe[] = [
  { name: "exact-domain", url: "https://example.com", allowed: true },
  { name: "model-api", url: "https://api.openai.com/v1/models", allowed: true },
  {
    name: "wildcard-registry",
    url: "https://registry.npmjs.org/typescript/latest",
    allowed: true,
  },
  { name: "wildcard-apex", url: "https://npmjs.org", allowed: false },
  { name: "unlisted-domain", url: "https://example.org", allowed: false },
  {
    name: "redirect-to-unlisted",
    url: "https://www.github.com",
    redirect: true,
    allowed: false,
  },
  { name: "raw-ipv4", host: "1.1.1.1", allowed: false },
  { name: "raw-ipv6", host: "2606:4700:4700::1111", allowed: false },
];

export const networkScenarios: readonly NetworkScenario[] = [
  { name: "baseline" },
  {
    name: "domains",
    egress: {
      mode: "allowlist",
      domains: [
        "example.com",
        "api.openai.com",
        "*.npmjs.org",
        "www.github.com",
      ],
    },
  },
  { name: "deny-all", egress: { mode: "deny-all" } },
  {
    name: "cidr-allow",
    egress: { mode: "allowlist", allowCidrs: ["1.1.1.1/32"] },
  },
  {
    name: "cidr-deny",
    egress: {
      mode: "allowlist",
      domains: ["example.com"],
      allowCidrs: ["1.1.1.1/32"],
      denyCidrs: ["1.1.1.1/32"],
    },
  },
];
