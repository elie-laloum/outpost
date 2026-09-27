import assert from "node:assert/strict";
import { test } from "node:test";
import {
  mkdtemp,
  readFile,
  readdir,
  readlink,
  stat,
  rm,
  writeFile,
} from "node:fs/promises";
import { basename, join } from "node:path";
import { tmpdir } from "node:os";
import { setTimeout as delay } from "node:timers/promises";
import { firecrackerSandboxProvider } from "../src/providers/firecracker.ts";
import type { FirecrackerOptions } from "../src/providers/firecracker.types.ts";

const config = process.env.OUTPOST_FIRECRACKER_JAILER_CONFIG;
test(
  "LIVE jailer: confinement, CPU throttling, memory enforcement and cleanup",
  { skip: !config, timeout: 180_000 },
  async (t) => {
    const options: FirecrackerOptions = JSON.parse(
      await readFile(config!, "utf8"),
    );
    const jailer = options.jailer;
    assert.ok(jailer);
    assert.equal(process.getuid?.(), 0);
    const root = await mkdtemp(join(tmpdir(), "outpost-jailer-live-"));
    const parent = join(jailer.directory, basename(options.binary));
    const before = await readdir(jailer.cgroup);
    const provider = firecrackerSandboxProvider(options);
    const lease = await provider.acquire({
      repository: root,
      directory: root,
      gitDirectories: [],
      variables: {},
    });
    let cgroup = "";
    let jail = "";
    try {
      const added = (await readdir(jailer.cgroup)).filter(
        (entry) => !before.includes(entry),
      );
      assert.equal(added.length, 1);
      cgroup = join(jailer.cgroup, added[0]!);
      jail = join(parent, added[0]!);
      const pids = (await readFile(join(cgroup, "cgroup.procs"), "utf8"))
        .trim()
        .split(/\s+/);
      assert.equal(pids.length, 1);
      const pid = pids[0]!;
      const status = await readFile(`/proc/${pid}/status`, "utf8");
      assert.match(
        status,
        new RegExp(
          `^Uid:\\s+${jailer.uid}\\s+${jailer.uid}\\s+${jailer.uid}\\s+${jailer.uid}$`,
          "m",
        ),
      );
      assert.match(status, /^CapEff:\s+0+$/m);
      assert.match(status, /^Seccomp:\s+2$/m);
      const processRoot = await stat(`/proc/${pid}/root`);
      const jailRoot = await stat(join(jail, "root"));
      assert.deepEqual(
        [processRoot.dev, processRoot.ino],
        [jailRoot.dev, jailRoot.ino],
      );
      assert.notEqual(
        await readlink(`/proc/${pid}/ns/mnt`),
        await readlink("/proc/self/ns/mnt"),
      );
      for (const [name, expected] of Object.entries({
        "cpu.max": `${jailer.cpuQuotaUs} 100000`,
        "memory.max": String(jailer.memoryMaxMb * 1024 * 1024),
        "memory.swap.max": "0",
        "pids.max": String(jailer.processes),
      }))
        assert.equal(
          (await readFile(join(cgroup, name), "utf8")).trim(),
          expected,
        );
      const beforeCpu = await readFile(join(cgroup, "cpu.stat"), "utf8");
      const busy = await lease.invoke({
        executable: "node",
        arguments: ["-e", "const end=Date.now()+3000;while(Date.now()<end){}"],
        deadlineMs: 15_000,
      });
      assert.equal(busy.status, 0);
      const afterCpu = await readFile(join(cgroup, "cpu.stat"), "utf8");
      const throttled = (value: string) =>
        Number(value.match(/^nr_throttled (\d+)$/m)?.[1]);
      assert.ok(
        throttled(afterCpu) > throttled(beforeCpu),
        "Use a CPU quota below one CPU for this stress test",
      );
      const sentinel = join(root, "host-only");
      await writeFile(sentinel, "not shared with guest");
      const escape = await lease.invoke({
        executable: "node",
        arguments: [
          "-e",
          `const fs=require('node:fs');for(const path of ${JSON.stringify([sentinel, jailer.directory, jailer.cgroup])}){if(fs.existsSync(path))process.exit(1)};try{fs.readFileSync('/proc/1/root/root/.ssh/authorized_keys');process.exit(2)}catch{};if(process.getuid()===0)process.exit(3)`,
        ],
      });
      assert.equal(escape.status, 0);
      t.diagnostic(
        JSON.stringify({
          pid,
          uid: jailer.uid,
          cgroup,
          root: join(jail, "root"),
          cpuBefore: beforeCpu,
          cpuAfter: afterCpu,
          confinement: [
            "unprivileged UID",
            "no effective capabilities",
            "seccomp filter",
            "separate mount namespace",
            "jail root",
            "host paths inaccessible from guest",
          ],
        }),
      );
      const network = await lease.invoke({
        executable: "node",
        arguments: [
          "-e",
          `const net=require('node:net');const targets=['1.1.1.1','172.30.240.1','fd42:30:240::1'];Promise.all(targets.map(host=>new Promise(resolve=>{const s=net.connect({host,port:443});const done=result=>{s.destroy();resolve({host,result})};s.setTimeout(2000,()=>done('timeout'));s.once('connect',()=>done('connected'));s.once('error',e=>done(e.code))}))).then(results=>{console.log(JSON.stringify(results));if(results.some(r=>r.result!=='timeout'))process.exit(1)})`,
        ],
      });
      assert.equal(network.status, 0, network.stdout + network.stderr);
      t.diagnostic(`Blocked IPv4/IPv6 attempts: ${network.stdout.trim()}`);
      await writeFile(join(cgroup, "memory.max"), String(16 * 1024 * 1024));
      let events = "";
      for (let attempt = 0; attempt < 100; attempt++) {
        events = await readFile(join(cgroup, "memory.events"), "utf8");
        if (Number(events.match(/^oom_kill (\d+)$/m)?.[1]) > 0) break;
        await delay(50);
      }
      assert.ok(
        Number(events.match(/^oom_kill (\d+)$/m)?.[1]) > 0,
        "Lowered cgroup memory limit must kill the VMM without affecting the host",
      );
      t.diagnostic(
        JSON.stringify({
          injectedMemoryLimit: 16 * 1024 * 1024,
          memoryEvents: events,
        }),
      );
    } finally {
      await lease.release();
      await lease.release();
      await rm(root, { recursive: true, force: true });
    }
    assert.deepEqual(await readdir(jailer.cgroup), before);
    await assert.rejects(readFile(join(jail, "root", "rootfs.ext4")), /ENOENT/);
    t.diagnostic(
      "Jail, private disk and cgroup removed after forced VMM OOM; operator-owned parents retained.",
    );
  },
);
