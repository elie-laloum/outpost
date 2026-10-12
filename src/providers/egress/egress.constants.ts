export const egressRuntime = Object.freeze({
  version: 1,
  uid: 65532,
  port: 18080,
  ready: "/run/outpost/ready",
  maxHelloBytes: 65_536,
  maxHelloRecords: 32,
  maxHeaderBytes: 16_384,
  maxConnections: 256,
  connectMs: 10_000,
  idleMs: 120_000,
  heartbeatMs: 1_000,
});

export const egressVariables = Object.freeze({
  HTTP_PROXY: "http://127.0.0.1:18080",
  HTTPS_PROXY: "http://127.0.0.1:18080",
  http_proxy: "http://127.0.0.1:18080",
  https_proxy: "http://127.0.0.1:18080",
  NO_PROXY: "localhost,127.0.0.1,::1",
  no_proxy: "localhost,127.0.0.1,::1",
  NODE_USE_ENV_PROXY: "1",
});
