import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { setTimeout } from "node:timers/promises";
import { containerProvider } from "../src/providers/container.ts";
import {
  executeProcess,
  requireSuccess,
} from "../src/infrastructure/process.ts";
import { repository } from "./helpers.ts";
import { egressTestTls } from "./fixtures/egress-tls.constants.ts";
import type { EgressPolicy } from "../src/domain/egress.types.ts";

test(
  "real container egress filters web, raw TCP/UDP, denials, proxy bypass and companion failure",
  { skip: !process.env.OUTPOST_CONTAINER_ENGINE, timeout: 120_000 },
  async (t) => {
    const engine =
      process.env.OUTPOST_CONTAINER_ENGINE === "podman" ? "podman" : "docker";
    const image = process.env.OUTPOST_EGRESS_IMAGE;
    assert.ok(image, "Build images/egress and set OUTPOST_EGRESS_IMAGE");
    const call = (args: readonly string[]) =>
      requireSuccess({
        executable: engine,
        arguments: args,
        deadlineMs: 30_000,
      });
    const root = await repository(t);
    const backend = `outpost-egress-test-${randomUUID()}`;
    const nodeImage =
      process.env.OUTPOST_FILE_CONTAINER_IMAGE ??
      "docker.io/library/node:24-slim";
    await call([
      "run",
      "-d",
      "--name",
      backend,
      "--network",
      "bridge",
      "--entrypoint",
      "node",
      nodeImage,
      "-e",
      `
    require('http').createServer((req,res)=>res.end(req.headers.host)).listen(80,'0.0.0.0');
    require('https').createServer(${JSON.stringify(egressTestTls)},(req,res)=>res.end('tls-ok')).listen(443,'0.0.0.0');
    require('net').createServer(s=>{s.on('error',()=>{});s.end('tcp-ok')}).listen(9000,'0.0.0.0');
    const udp=require('dgram').createSocket('udp4'); udp.on('message',(m,r)=>udp.send(m,r.port,r.address)); udp.bind(9001,'0.0.0.0',()=>console.log('ready'));
  `,
    ]);
    t.after(() => call(["rm", "--force", backend]));
    for (let attempt = 0; attempt < 30; attempt++) {
      if ((await call(["logs", backend])).stdout.includes("ready")) break;
      await setTimeout(100);
    }
    const ip = (
      await call([
        "inspect",
        "--format",
        "{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}",
        backend,
      ])
    ).stdout.trim();
    assert.match(ip, /^\d+\.\d+\.\d+\.\d+$/);
    const policies: EgressPolicy[] = [
      { mode: "allowlist", domains: ["allowed.example.test"] },
      { mode: "allowlist", allowCidrs: [`${ip}/32`] },
      {
        mode: "allowlist",
        domains: ["allowed.example.test"],
        allowCidrs: [`${ip}/32`],
        denyCidrs: [`${ip}/32`],
      },
    ];
    for (const [index, egress] of policies.entries()) {
      let name = "";
      const provider = containerProvider(
        engine,
        { image: nodeImage, egressImage: image, egress },
        (command) => {
          const args = command.arguments ?? [];
          if (
            args[0] === "create" &&
            args[args.indexOf("--name") + 1]?.endsWith("-egress")
          )
            return executeProcess({
              ...command,
              arguments: [
                "create",
                "--add-host",
                `allowed.example.test:${ip}`,
                "--add-host",
                `denied.example.test:${ip}`,
                ...args.slice(1),
              ],
            });
          return executeProcess(command);
        },
      );
      const lease = await provider.acquire({
        repository: root,
        directory: root,
        gitDirectories: [],
        variables: {},
        registerRecovery: async (id) => {
          name = id;
        },
      });
      try {
        const probe = async (code: string, elevated = false) => {
          const result = await lease.invoke({
            executable: "node",
            arguments: ["-e", code],
            deadlineMs: 8_000,
            elevated,
          });
          assert.equal(result.status, 0, result.stderr);
          return result.stdout.trim();
        };
        const web = `require('http').get({host:'127.0.0.1',port:18080,path:'http://${index === 1 ? ip : "allowed.example.test"}/'},r=>{console.log(r.statusCode);r.resume()}).on('error',()=>console.log('blocked'))`;
        assert.equal(await probe(web), index === 2 ? "403" : "200");
        if (index === 0) {
          assert.equal(
            await probe(
              `require('http').get({host:'127.0.0.1',port:18080,path:'http://denied.example.test/'},r=>{console.log(r.statusCode);r.resume()})`,
            ),
            "403",
          );
          assert.equal(
            await probe(`
          const socket=require('net').connect(18080,'127.0.0.1',()=>socket.write('CONNECT allowed.example.test:443 HTTP/1.1\\r\\nHost: allowed.example.test:443\\r\\n\\r\\n'));
          socket.once('data',()=>{const tls=require('tls').connect({socket,servername:'allowed.example.test',rejectUnauthorized:false},()=>tls.write('GET / HTTP/1.1\\r\\nHost: allowed.example.test\\r\\nConnection: close\\r\\n\\r\\n'));let data='';tls.on('data',b=>data+=b);tls.on('end',()=>console.log(data.includes('tls-ok')?'allowed':'blocked:'+JSON.stringify(data)));});
        `),
            "allowed",
          );
        }
        for (const elevated of [false, true]) {
          assert.equal(
            await probe(
              `
          const socket=require('net').connect(9000,${JSON.stringify(ip)}); socket.on('connect',()=>{console.log('allowed');socket.destroy()});socket.on('error',()=>console.log('blocked'));socket.setTimeout(500,()=>{console.log('blocked');socket.destroy()});
        `,
              elevated,
            ),
            index === 1 ? "allowed" : "blocked",
            `TCP policy ${index}, elevated ${elevated}`,
          );
        }
        assert.equal(
          await probe(`
        const socket=require('net').connect(9000,${JSON.stringify(`::ffff:${ip}`)});socket.on('connect',()=>{console.log('allowed');socket.destroy()});socket.on('error',()=>console.log('blocked'));socket.setTimeout(500,()=>{console.log('blocked');socket.destroy()});
      `),
          index === 1 ? "allowed" : "blocked",
        );
        assert.equal(
          await probe(`
        const socket=require('dgram').createSocket('udp4');const timer=setTimeout(()=>{console.log('blocked');socket.close()},500);socket.on('message',()=>{clearTimeout(timer);console.log('allowed');socket.close()});socket.send('probe',9001,${JSON.stringify(ip)});
      `),
          index === 1 ? "allowed" : "blocked",
        );
        const capabilities = await lease.invoke({
          executable: "node",
          arguments: [
            "-e",
            "try { process.setuid(65532); process.exit(1); } catch { console.log('refused'); }",
          ],
          elevated: true,
        });
        assert.equal(capabilities.status, 0);
        assert.match(capabilities.stdout, /refused/);
        if (index === 1) {
          await call(["kill", "--signal", "KILL", `${name}-egress`]);
          await setTimeout(3_500);
          assert.equal(
            await probe(
              `const s=require('net').connect(9000,${JSON.stringify(ip)});s.on('connect',()=>{console.log('allowed');s.destroy()});s.on('error',()=>console.log('blocked'));s.setTimeout(500,()=>{console.log('blocked');s.destroy()});`,
            ),
            "blocked",
          );
        }
      } catch (error) {
        t.diagnostic(
          (
            await call([
              "exec",
              `${name}-egress`,
              "nft",
              "list",
              "table",
              "inet",
              "outpost_egress",
            ])
          ).stdout,
        );
        t.diagnostic((await call(["logs", `${name}-egress`])).stderr);
        throw error;
      } finally {
        await lease.release();
      }
      const remaining = await call([
        "container",
        "ls",
        "--all",
        "--filter",
        `name=^${name}(-egress)?$`,
        "--format",
        "{{.Names}}",
      ]);
      assert.equal(remaining.stdout.trim(), "");
    }
    const unhealthy = containerProvider(engine, {
      image: nodeImage,
      egressImage: nodeImage,
      egress: policies[0]!,
    });
    await assert.rejects(
      unhealthy.acquire({
        repository: root,
        directory: root,
        gitDirectories: [],
        variables: {},
      }),
      /egress|provisioning/i,
    );
  },
);
