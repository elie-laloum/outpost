// Checks one built official image the way Outpost runs it: arbitrary UID, private tmpfs home, no network.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";

const [engine, image, name] = process.argv.slice(2);
assert.ok(
  (engine === "docker" || engine === "podman") && image && name,
  "Usage: node scripts/image-smoke.mjs docker|podman IMAGE NAME",
);
const executables = {
  harness: [],
  codex: ["codex"],
  claude: ["claude"],
  antigravity: ["agy"],
  copilot: ["copilot"],
  kimi: ["kimi"],
}[name];
assert.ok(executables, `Unknown image name ${name}`);
const checks = [
  "node --version",
  "git --version",
  "command -v setsid kill tar cp sleep >/dev/null",
  'test "$HOME" = /home/agent && test -w "$HOME" && touch "$HOME/probe"',
  ...executables.map((executable) => `${executable} --version`),
];
const output = execFileSync(
  engine,
  [
    "run",
    "--rm",
    "--network",
    "none",
    "--user",
    "1000:1000",
    "--tmpfs",
    "/home/agent:rw,mode=0700,uid=1000,gid=1000",
    "--entrypoint",
    "sh",
    image,
    "-ec",
    checks.join("\n"),
  ],
  { encoding: "utf8", timeout: 120_000 },
);
process.stdout.write(output);
console.log(`${engine}: ${image} passed ${checks.length} checks`);
