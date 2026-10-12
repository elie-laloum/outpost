import { test } from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { request } from "node:http";
import { connect } from "node:net";
import { containerProvider } from "../../src/providers/container.ts";
import { recoverContainer } from "../../src/providers/container-recovery.ts";
import { egressAccess } from "../../src/providers/egress/policy.ts";
import { createEgressProxy } from "../../src/providers/egress/proxy.ts";
import { tlsServerName } from "../../src/providers/egress/tls-hello.ts";
import { egressCidr } from "../../src/providers/egress/address.ts";
import { repository } from "../helpers.ts";
import type { Command } from "../../src/domain/command.types.ts";

test("container allowlists reject unmanaged networks and invalid companion images", () => {
  for (const networks of ["none", "host", ["bridge"]])
    assert.throws(
      () =>
        containerProvider("docker", {
          networks,
          egress: { mode: "allowlist", domains: ["example.com"] },
        }),
      /conflicts/,
    );
  for (const egressImage of ["", "-bad", "some image"])
    assert.throws(
      () =>
        containerProvider("docker", {
          egressImage,
          egress: { mode: "allowlist", domains: ["example.com"] },
        }),
      /Invalid egressImage/,
    );
  assert.throws(
    () => containerProvider("docker", { egressImage: "proxy" }),
    /requires/,
  );
});

test("allowlists establish a private policy owner before creating the sandbox and snapshot caller data", async (t) => {
  const root = await repository(t);
  for (const [engine, platform] of [
    ["docker", "linux"],
    ["podman", "linux"],
    ["podman", "darwin"],
  ] as const) {
    const calls: Command[] = [];
    const domains = ["example.com"];
    let id = "";
    const provider = containerProvider(
      engine,
      {
        image: "agent",
        egressImage: "proxy",
        egress: { mode: "allowlist", domains },
      },
      async (command) => {
        calls.push(command);
        if (command.arguments?.[0] === "machine")
          return { status: 0, stdout: '[{"Running":true}]', stderr: "" };
        return {
          status: 0,
          stdout:
            command.arguments?.[0] === "container" ? `${id}-egress\n` : "",
          stderr: "",
        };
      },
      platform,
    );
    domains.push("other.example.com");
    const lease = await provider.acquire({
      repository: root,
      directory: root,
      gitDirectories: [],
      variables: {},
      registerRecovery: async (name) => {
        id = name;
      },
    });
    const creates = calls.filter(
      (command) => command.arguments?.[0] === "create",
    );
    assert.equal(creates.length, 2);
    const gateway = creates[0]!.arguments!;
    const sandbox = creates[1]!.arguments!;
    assert.ok(gateway.includes("NET_ADMIN"));
    assert.ok(!sandbox.includes("NET_ADMIN"));
    assert.ok(!gateway.includes("--volume"));
    assert.ok(!gateway.includes("--privileged"));
    assert.ok(sandbox.includes(`container:${id}-egress`));
    const declaration = gateway.find((argument) =>
      argument.startsWith("OUTPOST_EGRESS_POLICY="),
    )!;
    assert.deepEqual(
      JSON.parse(declaration.slice(declaration.indexOf("=") + 1)).domains,
      ["example.com"],
    );
    const healthy = calls.findIndex(
      (command) => command.arguments?.at(-2) === "health",
    );
    assert.ok(healthy < calls.indexOf(creates[1]!));
    await lease.invoke({ executable: "node", arguments: ["-v"] });
    assert.ok(
      calls.some((command) =>
        Object.values(command.variables ?? {}).includes(
          "http://127.0.0.1:18080",
        ),
      ),
    );
    await lease.release();
    await lease.release();
    assert.deepEqual(
      calls
        .filter((command) => command.arguments?.[0] === "rm")
        .map((command) => command.arguments?.at(-1)),
      [id, `${id}-egress`],
    );
  }
});

test("failed and cancelled egress setup cannot expose a sandbox and retains cleanup failures", async (t) => {
  const root = await repository(t);
  for (const failure of ["health", "cancel", "cleanup"] as const) {
    const calls: Command[] = [];
    const controller = new AbortController();
    let id = "";
    const provider = containerProvider(
      "docker",
      {
        image: "agent",
        egressImage: "proxy",
        egress: { mode: "allowlist", domains: ["example.com"] },
      },
      async (command) => {
        calls.push(command);
        if (command.arguments?.at(-2) === "health") {
          if (failure === "cancel") controller.abort(new Error("cancelled"));
          return { status: 1, stdout: "", stderr: "unhealthy" };
        }
        if (failure === "cleanup" && command.arguments?.[0] === "rm")
          throw new Error("cleanup failed");
        return {
          status: 0,
          stdout:
            command.arguments?.[0] === "container" ? `${id}-egress` : "false",
          stderr: "",
        };
      },
    );
    await assert.rejects(
      provider.acquire({
        repository: root,
        directory: root,
        gitDirectories: [],
        variables: {},
        signal: controller.signal,
        registerRecovery: async (name) => {
          id = name;
        },
      }),
      failure === "cleanup" ? AggregateError : Error,
    );
    assert.equal(
      calls.filter((command) => command.arguments?.[0] === "create").length,
      1,
    );
    assert.ok(calls.some((command) => command.arguments?.[0] === "rm"));
  }
});

test("recovery removes a companion even when provisioning never created the sandbox", async () => {
  const name = "outpost-12345678-1234-1234-1234-123456789abc";
  for (const found of [`${name}-egress`, `${name}-egress\n${name}`]) {
    const removed: string[] = [];
    await recoverContainer(
      "docker",
      async (command) => {
        if (command.arguments?.[0] === "rm")
          removed.push(command.arguments.at(-1)!);
        return {
          status: 0,
          stdout: command.arguments?.[0] === "container" ? found : "",
          stderr: "",
        };
      },
      name,
    );
    assert.deepEqual(
      removed,
      found.includes("\n") ? [name, `${name}-egress`] : [`${name}-egress`],
    );
  }
});

test("release retries companion cleanup after the sandbox has already been removed", async (t) => {
  const root = await repository(t);
  let id = "",
    sandboxRemovals = 0,
    companionRemovals = 0;
  const provider = containerProvider(
    "docker",
    {
      image: "agent",
      egressImage: "proxy",
      egress: { mode: "allowlist", domains: ["example.com"] },
    },
    async (command) => {
      const args = command.arguments ?? [];
      if (args[0] === "rm" && args.at(-1) === id) sandboxRemovals++;
      if (
        args[0] === "rm" &&
        args.at(-1) === `${id}-egress` &&
        ++companionRemovals === 1
      )
        return { status: 1, stdout: "", stderr: "temporary cleanup failure" };
      return {
        status: 0,
        stdout: args[0] === "container" ? `${id}-egress` : "",
        stderr: "",
      };
    },
  );
  const lease = await provider.acquire({
    repository: root,
    directory: root,
    gitDirectories: [],
    variables: {},
    registerRecovery: async (name) => {
      id = name;
    },
  });
  await assert.rejects(lease.release());
  await lease.release();
  assert.equal(sandboxRemovals, 1);
  assert.equal(companionRemovals, 2);
});

test("domain and CIDR authorization pins resolved addresses and gives denials precedence", async () => {
  const access = egressAccess({
    mode: "allowlist",
    domains: ["*.example.com", "EXACT.test"],
    allowCidrs: ["192.0.2.0/24", "2001:db8::/32"],
    denyCidrs: ["192.0.2.9/32", "2001:db8:1::/48"],
  });
  assert.equal(access.domain("example.com"), false);
  assert.equal(access.domain("a.example.com"), true);
  assert.equal(access.domain("badexample.com"), false);
  assert.equal(access.domain(".example.com"), false);
  assert.equal(access.domain("a..example.com"), false);
  assert.equal(access.domain("exact.TEST"), true);
  assert.equal(
    (
      await access.resolve("host.example.com", async () => [
        { address: "203.0.113.4", family: 4 },
      ])
    ).address,
    "203.0.113.4",
  );
  assert.equal((await access.resolve("192.0.2.8")).family, 4);
  assert.equal((await access.resolve("2001:db8:2::1")).family, 6);
  for (const address of [
    "192.0.2.9",
    "::ffff:192.0.2.9",
    "2001:db8:1::1",
    "198.51.100.1",
  ])
    await assert.rejects(access.resolve(address), /denied/);
  for (const address of ["127.0.0.1", "::1", "::ffff:127.0.0.1", "192.0.2.9"])
    await assert.rejects(
      access.resolve("host.example.com", async () => [
        { address, family: address.includes(":") ? 6 : 4 },
      ]),
      /denied/,
    );
  await assert.rejects(
    access.resolve("host.example.com", async () => []),
    /denied/,
  );
});

test("proxy refuses unlisted names before DNS and normalizes mapped CIDRs without mixing address families", async () => {
  const access = egressAccess({
    mode: "allowlist",
    allowCidrs: ["192.0.2.0/24"],
    denyCidrs: ["::/0"],
  });
  let resolved = false;
  await assert.rejects(
    access.resolve("unlisted.example.com", async () => {
      resolved = true;
      return [{ address: "192.0.2.1", family: 4 }];
    }),
    /denied/,
  );
  assert.equal(resolved, false);
  assert.equal((await access.resolve("192.0.2.1")).family, 4);
  assert.equal((await access.resolve("::ffff:192.0.2.1")).address, "192.0.2.1");
  assert.equal(egressCidr("::ffff:192.0.2.0/120"), "192.0.2.0/24");
  assert.throws(
    () =>
      containerProvider("docker", {
        egress: { mode: "allowlist", allowCidrs: ["::ffff:192.0.2.0/80"] },
      }),
    /prefix/,
  );
});

function hello(name: string): Buffer {
  const hostname = Buffer.from(name);
  const extension = Buffer.alloc(9 + hostname.length);
  extension.writeUInt16BE(5 + hostname.length, 2);
  extension.writeUInt16BE(3 + hostname.length, 4);
  extension.writeUInt16BE(hostname.length, 7);
  hostname.copy(extension, 9);
  const body = Buffer.concat([
    Buffer.from([3, 3]),
    Buffer.alloc(32),
    Buffer.from([0, 0, 2, 0x13, 1, 1, 0]),
    Buffer.from([extension.length >> 8, extension.length & 255]),
    extension,
  ]);
  const handshake = Buffer.alloc(4);
  handshake[0] = 1;
  handshake.writeUIntBE(body.length, 1, 3);
  const record = Buffer.alloc(5);
  record[0] = 22;
  record[1] = 3;
  record[2] = 1;
  record.writeUInt16BE(body.length + 4, 3);
  return Buffer.concat([record, handshake, body]);
}

test("TLS inspection accepts fragmented ClientHello and rejects non-TLS or oversized input", () => {
  const input = hello("API.example.com");
  assert.equal(tlsServerName(input), "api.example.com");
  for (let size = 0; size < input.length; size++)
    assert.equal(tlsServerName(input.subarray(0, size)), undefined);
  const first = Buffer.from(input.subarray(0, 25));
  first.writeUInt16BE(20, 3);
  const second = Buffer.from(input.subarray(0, 5));
  second.writeUInt16BE(input.length - 25, 3);
  assert.equal(
    tlsServerName(Buffer.concat([first, second, input.subarray(25)])),
    "api.example.com",
  );
  assert.throws(() => tlsServerName(Buffer.from("SSH-2.0-bypass\r\n")), /TLS/);
  assert.throws(() => tlsServerName(Buffer.alloc(65_537)), /large/);
  const duplicated = Buffer.concat([input, input.subarray(52)]);
  duplicated.writeUInt16BE(duplicated.length - 5, 3);
  duplicated.writeUIntBE(duplicated.length - 9, 6, 3);
  duplicated.writeUInt16BE(duplicated.length - 52, 50);
  assert.throws(() => tlsServerName(duplicated), /Duplicate/);
  const unnamed = Buffer.from(input);
  unnamed.writeUInt16BE(1, 52);
  assert.throws(() => tlsServerName(unnamed), /server name required/);
  const emptyRecords = Buffer.concat(
    Array.from({ length: 33 }, () => Buffer.from([22, 3, 1, 0, 0])),
  );
  assert.throws(() => tlsServerName(emptyRecords), /Too many/);
  assert.throws(() => tlsServerName(hello("bad\u00e9.example.com")), /Invalid/);
});

test("proxy refuses forbidden destinations, non-web ports and mismatched TLS names", async (t) => {
  const server = createEgressProxy(
    { mode: "allowlist", domains: ["allowed.example.com"] },
    async () => [{ address: "192.0.2.10", family: 4 }],
  );
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => {
    server.closeAllConnections();
    server.close();
  });
  const address = server.address();
  assert.ok(address && typeof address === "object");
  for (const path of [
    "http://denied.example.com/",
    "http://allowed.example.com:22/",
    "https://allowed.example.com/",
    "http://user:pass@allowed.example.com/",
  ]) {
    const status = await new Promise<number | undefined>((resolve, reject) => {
      const req = request(
        { host: "127.0.0.1", port: address.port, path },
        (response) => {
          response.resume();
          resolve(response.statusCode);
        },
      );
      req.on("error", reject);
      req.end();
    });
    assert.equal(status, 403);
  }
  for (const target of [
    "allowed.example.com:22",
    "denied.example.com:443",
    "allowed.example.com:443",
  ]) {
    const socket = connect(address.port, "127.0.0.1");
    await once(socket, "connect");
    socket.write(`CONNECT ${target} HTTP/1.1\r\nHost: ${target}\r\n\r\n`);
    const [chunk] = await once(socket, "data");
    if (target === "allowed.example.com:443") {
      assert.match(String(chunk), /200/);
      socket.write(hello("denied.example.com"));
    } else assert.match(String(chunk), /403/);
    await once(socket, "close");
  }
});
