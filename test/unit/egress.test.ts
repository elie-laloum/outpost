import { test } from "node:test";
import assert from "node:assert/strict";
import { validateEgress } from "../../src/domain/egress.ts";
import { containerProvider } from "../../src/providers/container.ts";
import { createLocalSandboxProvider } from "../../src/providers/local.ts";
import { createDaytonaSandboxProvider } from "../../src/providers/daytona.ts";
import { createVercelSandboxProvider } from "../../src/providers/vercel.ts";
import { vercelNetworkPolicy } from "../../src/providers/vercel-network.ts";
import type { VercelOptions } from "../../src/providers/vercel.types.ts";
import { daytonaNetworkPolicy } from "../../src/providers/daytona-network.ts";
import type { Sandbox as DaytonaSandbox } from "@daytona/sdk";
import type { DaytonaOptions } from "../../src/providers/daytona.types.ts";
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
    const sandboxProvider = containerProvider(
      engine,
      { egress: { mode: "deny-all" }, networks },
      async (command) => {
        calls.push(command);
        return { status: 0, stdout: "", stderr: "" };
      },
      "linux",
    );
    networks.push("host");
    const lease = await sandboxProvider.acquire({
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
      createVercelSandboxProvider({
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
  const sandboxProvider = createVercelSandboxProvider(
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
    sandboxProvider.acquire({
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
  assert.throws(
    () => createLocalSandboxProvider(options),
    /cannot enforce egress/,
  );
});

test("Vercel snapshots native firewall rules before caller mutation", () => {
  const native = { allow: ["example.com"], subnets: { deny: ["10.0.0.0/8"] } };
  const policy = vercelNetworkPolicy({ create: { networkPolicy: native } });
  native.allow.push("*");
  native.subnets.deny.length = 0;
  assert.deepEqual(policy, {
    allow: ["example.com"],
    subnets: { deny: ["10.0.0.0/8"] },
  });
});

test("Daytona translates only representable restrictions", () => {
  assert.equal(daytonaNetworkPolicy({}), undefined);
  assert.deepEqual(daytonaNetworkPolicy({ egress: { mode: "deny-all" } }), {
    networkBlockAll: true,
  });
  assert.deepEqual(
    daytonaNetworkPolicy({
      egress: { mode: "allowlist", domains: ["example.com", "*.example.com"] },
    }),
    { domainAllowList: "example.com,*.example.com" },
  );
  assert.deepEqual(
    daytonaNetworkPolicy({
      egress: { mode: "allowlist", allowCidrs: ["10.0.0.0/8", "192.0.2.0/24"] },
    }),
    { networkAllowList: "10.0.0.0/8,192.0.2.0/24" },
  );
  for (const egress of [
    { mode: "allowlist", domains: ["example.com"], denyCidrs: ["10.0.0.0/8"] },
    { mode: "allowlist", domains: ["example.com"], allowCidrs: ["10.0.0.0/8"] },
    { mode: "allowlist", allowCidrs: ["::/0"] },
    { mode: "allowlist", domains: ["*.example.com"] },
    {
      mode: "allowlist",
      domains: Array.from(
        { length: 101 },
        (_, index) => `host${index}.example.com`,
      ),
    },
    {
      mode: "allowlist",
      allowCidrs: Array.from(
        { length: 11 },
        (_, index) => `10.0.0.${index}/32`,
      ),
    },
  ] as const)
    assert.throws(() => createDaytonaSandboxProvider({ egress }), {
      code: "configuration",
    });
  for (const create of [
    { networkBlockAll: false },
    { networkAllowList: "" },
    { domainAllowList: "example.com" },
    { outboundProxyUrl: "http://proxy.example.com" },
  ])
    assert.throws(
      () =>
        createDaytonaSandboxProvider({ create, egress: { mode: "deny-all" } }),
      /not both/,
    );
});

test("Daytona confirms a frozen policy before workspace setup and releases once", async () => {
  const calls: string[] = [];
  const domains = ["example.com"];
  const create = { language: "typescript" };
  const sandbox = {
    updateNetworkSettings: async (settings: unknown) => {
      assert.deepEqual(settings, { domainAllowList: "example.com" });
      calls.push("confirm");
    },
    getUserHomeDir: async () => {
      calls.push("home");
      return "/home/test";
    },
    fs: {
      createFolder: async () => {
        calls.push("folder");
      },
    },
  } as unknown as DaytonaSandbox;
  const provider = createDaytonaSandboxProvider(
    { egress: { mode: "allowlist", domains }, create },
    async () => ({
      create: async (settings) => {
        assert.deepEqual(settings, {
          language: "typescript",
          domainAllowList: "example.com",
        });
        calls.push("create");
        return sandbox;
      },
      delete: async () => {
        calls.push("delete");
      },
    }),
  );
  domains.push("*.other.com");
  Object.assign(create, {
    networkBlockAll: false,
    domainAllowList: "*.other.com",
  });
  const lease = await provider.acquire({
    repository: "/repo",
    directory: "/repo",
    gitDirectories: [],
    variables: {},
  });
  await lease.release();
  await lease.release();
  assert.deepEqual(calls, ["create", "confirm", "home", "folder", "delete"]);
});

test("Daytona rejects unconfirmed enforcement and cleans up before any workspace operation", async () => {
  for (const failure of [
    "rejected",
    "missing-method",
    "cleanup-failed",
    "cancelled",
    "late-allocation",
  ] as const) {
    const controller = new AbortController();
    const cause = new Error("network policy rejected");
    let deleted = 0,
      commands = 0,
      confirmations = 0;
    const sandbox = {
      ...(failure === "missing-method"
        ? {}
        : {
            updateNetworkSettings: async () => {
              confirmations++;
              if (failure === "cancelled") {
                controller.abort();
                return;
              }
              throw cause;
            },
          }),
      getUserHomeDir: async () => {
        commands++;
        return "/home/test";
      },
    } as unknown as DaytonaSandbox;
    const provider = createDaytonaSandboxProvider(
      { egress: { mode: "deny-all" } },
      async () => ({
        create: async () => {
          if (failure === "late-allocation") controller.abort();
          return sandbox;
        },
        delete: async () => {
          deleted++;
          if (failure === "cleanup-failed") throw new Error("cleanup failed");
        },
      }),
    );
    await assert.rejects(
      provider.acquire({
        repository: "/repo",
        directory: "/repo",
        gitDirectories: [],
        variables: {},
        signal: controller.signal,
      }),
      (error: unknown) => {
        if (failure === "cleanup-failed") {
          assert.ok(error instanceof AggregateError);
          assert.equal(error.errors.length, 2);
          return true;
        }
        if (controller.signal.aborted) {
          assert.equal(error, controller.signal.reason);
          return true;
        }
        assert.ok(error instanceof Error);
        assert.match(error.message, /could not confirm egress/);
        if (failure === "rejected") assert.equal(error.cause, cause);
        return true;
      },
    );
    assert.equal(deleted, 1, failure);
    assert.equal(commands, 0, failure);
    if (failure === "late-allocation") assert.equal(confirmations, 0);
  }
});

test("Daytona native configuration remains available without Outpost enforcement claims", async () => {
  const create: NonNullable<DaytonaOptions["create"]> = {
    networkBlockAll: true,
  };
  const provider = createDaytonaSandboxProvider({ create }, async () => ({
    create: async (settings) => {
      assert.deepEqual(settings, { networkBlockAll: true });
      throw new Error("allocation probe");
    },
    delete: async () => {},
  }));
  create.networkBlockAll = false;
  await assert.rejects(
    provider.acquire({
      repository: "/repo",
      directory: "/repo",
      gitDirectories: [],
      variables: {},
    }),
    /allocation probe/,
  );
});

test("Vercel snapshots absent native settings and isolates successive allocations", async () => {
  for (const native of [undefined, { allow: ["example.com"] }]) {
    const create: NonNullable<VercelOptions["create"]> = native
      ? { networkPolicy: native }
      : {};
    let calls = 0;
    const provider = createVercelSandboxProvider(
      { create },
      async (settings) => {
        calls++;
        assert.deepEqual(
          structuredClone(settings?.networkPolicy),
          native ? { allow: ["example.com"] } : undefined,
        );
        const policy = settings?.networkPolicy;
        if (policy && typeof policy === "object" && Array.isArray(policy.allow))
          policy.allow.push("*");
        throw new Error("allocation probe");
      },
    );
    create.networkPolicy = "allow-all";
    for (let attempt = 0; attempt < 2; attempt++) {
      await assert.rejects(
        provider.acquire({
          repository: "/repo",
          directory: "/repo",
          gitDirectories: [],
          variables: {},
        }),
        /allocation probe/,
      );
    }
    assert.equal(calls, 2);
  }
});
