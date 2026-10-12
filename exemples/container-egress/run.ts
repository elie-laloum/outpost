import { createWorkspace } from "../../src/index.ts";
import { createDockerSandboxProvider } from "../../src/providers/docker.ts";
import { createPodmanSandboxProvider } from "../../src/providers/podman.ts";

const factories = {
  docker: createDockerSandboxProvider,
  podman: createPodmanSandboxProvider,
};
const engine = process.argv[2] ?? "docker";
if (engine !== "docker" && engine !== "podman")
  throw new Error(
    "Usage: node exemples/container-egress/run.ts [docker|podman]",
  );

await using workspace = await createWorkspace({
  source: { kind: "ephemeral" },
  runtime: { directory: "./.outpost", namespace: "egress-example" },
});
await using sandbox = await workspace.sandbox({
  sandboxProvider: factories[engine]({
    image:
      process.env.OUTPOST_CONTAINER_IMAGE ?? "docker.io/library/node:24-slim",
    ...(process.env.OUTPOST_EGRESS_IMAGE
      ? { egressImage: process.env.OUTPOST_EGRESS_IMAGE }
      : {}),
    egress: {
      mode: "allowlist",
      domains: ["example.com"],
      allowCidrs: ["1.1.1.1/32"],
      denyCidrs: ["192.0.2.42/32"],
    },
  }),
});

const result = await sandbox.command({
  executable: "node",
  arguments: [
    "-e",
    `
    (async () => {
      const allowed = await fetch('https://example.com', { signal: AbortSignal.timeout(10000) });
      console.log('Allowed HTTPS:', allowed.status);
      try {
        await fetch('https://example.org', { signal: AbortSignal.timeout(3000) });
        throw new Error('Unexpected access to a denied domain');
      } catch (error) {
        if (error.message === 'Unexpected access to a denied domain') throw error;
        console.log('Unlisted HTTPS: blocked');
      }
      const socket = require('net').connect(443, '1.1.1.1');
      socket.setTimeout(3000, () => socket.destroy(new Error('TCP destination unavailable')));
      socket.on('connect', () => { console.log('Allowed CIDR: TCP connected'); socket.destroy(); });
      socket.on('error', error => { console.error(error.message); process.exitCode = 1; });
    })().catch(error => { console.error(error.message); process.exitCode = 1; });
  `,
  ],
  deadlineMs: 20_000,
});
process.stdout.write(result.stdout);
if (result.status !== 0)
  throw new Error(result.stderr || "Network example failed");
