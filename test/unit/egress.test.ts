import { test } from "node:test";
import assert from "node:assert/strict";
import { validateEgress } from "../../src/domain/egress.ts";
import { containerProvider } from "../../src/providers/container.ts";
import { local } from "../../src/providers/local.ts";
import { daytona } from "../../src/providers/daytona.ts";
import { vercel } from "../../src/providers/vercel.ts";
import { vercelNetworkPolicy } from "../../src/providers/vercel-network.ts";
import type { VercelOptions } from "../../src/providers/vercel.types.ts";
import type { Command } from "../../src/index.ts";
import { repository } from "../helpers.ts";

test("egress policies reject malformed, ambiguous and unrestricted domain patterns", () => {
  for (const policy of [
    null,
    [],
    "deny-all",
    {},
    { mode: "open" },
    { mode: "deny-all", domains: [] },
    { mode: "allowlist", domain: "example.com" },
    { mode: "allowlist" },
    { mode: "allowlist", domains: "example.com" },
    { mode: "allowlist", domains: Array(1) },
  ])
    assert.throws(() => validateEgress(policy), { code: "configuration" });
  for (const domain of [
    "*",
    "*.com",
    "localhost",
    "https://example.com",
    "example.com:443",
    "api*.example.com",
    "a..example.com",
    "example.com.",
    "-api.example.com",
    "127.0.0.1",
    3,
    "a".repeat(64) + ".com",
    "a.".repeat(130) + "com",
  ])
    assert.throws(
      () => validateEgress({ mode: "allowlist", domains: [domain] }),
      { code: "configuration" },
    );
  for (const cidr of [
    "10.0.0.1",
    "10.0.0.0/33",
    "10.0.0.0/-1",
    "10.0.0.0/01",
    "10.0.0.0/8/1",
    "no/8",
    "::/129",
    "fe80::1%eth0/64",
  ])
    assert.throws(
      () => validateEgress({ mode: "allowlist", allowCidrs: [cidr] }),
      { code: "configuration" },
    );
  assert.deepEqual(
    validateEgress({
      mode: "allowlist",
      domains: ["*.example.com", "EXAMPLE.com", "*.example.com"],
      allowCidrs: ["10.0.0.0/8", "2001:db8::/32"],
      denyCidrs: ["10.1.0.0/16"],
    }),
    {
      mode: "allowlist",
      domains: ["*.example.com", "EXAMPLE.com"],
      allowCidrs: ["10.0.0.0/8", "2001:db8::/32"],
      denyCidrs: ["10.1.0.0/16"],
    },
  );
});

test("container deny-all is enforced at creation and survives caller mutation", async (t) => {
  const root = await repository(t);
  for (const engine of ["docker", "podman"] as const) {
    const calls: Command[] = [];
    const networks = ["none"];
    const provider = containerProvider(
      engine,
      { egress: { mode: "deny-all" }, networks },
      async (command) => {
        calls.push(command);
        return { status: 0, stdout: "", stderr: "" };
      },
      "linux",
    );
    networks.push("host");
    const lease = await provider.acquire({
      repository: root,
      directory: root,
      gitDirectories: [],
      variables: {},
    });
    const args = calls.find(
      (command) => command.arguments?.[0] === "create",
    )!.arguments!;
    assert.equal(args[args.indexOf("--network") + 1], "none");
    assert.equal(args.filter((arg) => arg === "--network").length, 1);
    assert.ok(!args.includes("host"));
    await lease.release();
    assert.throws(
      () =>
        containerProvider(engine, {
          egress: { mode: "allowlist", domains: ["example.com"] },
        }),
      /cannot enforce/,
    );
    assert.throws(
      () =>
        containerProvider(engine, {
          egress: { mode: "deny-all" },
          networks: "bridge",
        }),
      /conflicts/,
    );
  }
});

test("Vercel preserves native configuration and translates restricted policies", () => {
  assert.equal(vercelNetworkPolicy({}), undefined);
  assert.equal(
    vercelNetworkPolicy({ egress: { mode: "deny-all" } }),
    "deny-all",
  );
  assert.equal(
    vercelNetworkPolicy({ create: { networkPolicy: "allow-all" } }),
    "allow-all",
  );
  assert.throws(
    () =>
      vercel({
        egress: { mode: "deny-all" },
        create: { networkPolicy: "allow-all" },
      }),
    /not both/,
  );
  assert.deepEqual(
    vercelNetworkPolicy({
      egress: { mode: "allowlist", domains: ["example.com"] },
    }),
    { allow: ["example.com"], subnets: { allow: [], deny: [] } },
  );
  assert.deepEqual(
    vercelNetworkPolicy({
      egress: {
        mode: "allowlist",
        allowCidrs: ["10.0.0.0/8"],
        denyCidrs: ["10.1.0.0/16"],
      },
    }),
    { allow: [], subnets: { allow: ["10.0.0.0/8"], deny: ["10.1.0.0/16"] } },
  );
});

test("Vercel sends egress before allocation and snapshots the caller policy", async () => {
  const domains = ["example.com"];
  let received: VercelOptions["create"];
  const provider = vercel(
    {
      egress: { mode: "allowlist", domains },
      create: { env: { PRESET: "yes" } },
    },
    async (config) => {
      received = config;
      throw new Error("allocation probe");
    },
  );
  domains.push("*.other.com");
  await assert.rejects(
    provider.acquire({
      repository: "/repo",
      directory: "/repo",
      gitDirectories: [],
      variables: { CONTEXT: "yes" },
    }),
    /allocation probe/,
  );
  assert.deepEqual(received?.networkPolicy, {
    allow: ["example.com"],
    subnets: { allow: [], deny: [] },
  });
  assert.deepEqual(received?.env, { PRESET: "yes", CONTEXT: "yes" });
});

test("unsupported providers reject policies supplied through shared configuration", () => {
  const options = { variables: {}, egress: { mode: "deny-all" } };
  assert.throws(() => local(options), /cannot enforce egress/);
  assert.throws(() => daytona(options), /does not support Outpost egress/);
});
