export const daytonaNetworkFields = [
  "networkBlockAll",
  "networkAllowList",
  "domainAllowList",
  "outboundProxyUrl",
] as const;

export const daytonaNetworkLimits = { domains: 100, cidrs: 10 } as const;
