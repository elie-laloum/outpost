import { spawn, execFileSync } from "node:child_process";
import { writeFileSync, readFileSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { validateEgress } from "../../domain/egress.ts";
import { egressRuntime } from "./egress.constants.ts";
import { egressFirewall, egressHeartbeat } from "./firewall.ts";
import { createEgressProxy } from "./proxy.ts";

function run(): void {
  if (process.argv[2] === "health") {
    if (
      process.argv[3] !== String(egressRuntime.version) ||
      readFileSync(egressRuntime.ready, "utf8") !==
        String(egressRuntime.version)
    )
      throw new Error("Egress not ready");
    return;
  }
  const policy = validateEgress(
    JSON.parse(process.env.OUTPOST_EGRESS_POLICY ?? "null"),
  );
  if (policy?.mode !== "allowlist") throw new Error("Allowlist required");
  if (process.argv[2] === "proxy") {
    process.setgroups!([]);
    process.setgid!(egressRuntime.uid);
    process.setuid!(egressRuntime.uid);
    const server = createEgressProxy(policy);
    server.listen(egressRuntime.port, "127.0.0.1", () =>
      process.send?.("ready"),
    );
    return;
  }
  const nft = (input: string) =>
    execFileSync("nft", ["-f", "-"], {
      input,
      timeout: 2_000,
      stdio: ["pipe", "ignore", "pipe"],
    });
  nft(egressFirewall(policy));
  const child = spawn(
    process.execPath,
    [fileURLToPath(import.meta.url), "proxy"],
    { stdio: ["ignore", "inherit", "inherit", "ipc"] },
  );
  let heartbeat: ReturnType<typeof setInterval> | undefined;
  const stop = () => {
    clearInterval(heartbeat);
    rmSync(egressRuntime.ready, { force: true });
    try {
      nft("flush set inet outpost_egress live");
    } finally {
      child.kill("SIGKILL");
    }
  };
  child.once("message", (message: unknown) => {
    if (message !== "ready") {
      stop();
      return;
    }
    const refresh = () => {
      try {
        nft(egressHeartbeat());
      } catch {
        stop();
        process.exitCode = 1;
      }
    };
    try {
      nft(egressHeartbeat());
    } catch {
      stop();
      process.exitCode = 1;
      return;
    }
    writeFileSync(egressRuntime.ready, String(egressRuntime.version), {
      mode: 0o600,
    });
    heartbeat = setInterval(refresh, egressRuntime.heartbeatMs);
  });
  child.once("exit", () => {
    stop();
    process.exitCode = 1;
  });
  child.once("error", () => {
    stop();
    process.exitCode = 1;
  });
  process.once("SIGTERM", stop);
  process.once("SIGINT", stop);
}

try {
  run();
} catch {
  process.stderr.write("Outpost egress startup or health check failed\n");
  process.exitCode = 1;
}
