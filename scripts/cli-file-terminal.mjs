import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { builtInAgent } from "../src/adapters/agents/catalog.ts";

const args = process.argv.slice(2);
assert.ok(process.stdin.isTTY, "Run the terminal driver inside a PTY");
const descriptor = builtInAgent(args[0]);
assert.ok(descriptor, "Select a built-in agent");
assert.ok(args.includes("--live"), "Paid validation requires --live");
assert.equal(args[args.indexOf("--suite") + 1], "interactive");
const quote = (value) => `'${value.replaceAll("'", "'\\''")}'`;
const invocation = [
  process.execPath,
  fileURLToPath(new URL("./cli-file-live.mjs", import.meta.url)),
  ...args,
]
  .map(quote)
  .join(" ");
const command = `stty cols 120 rows 40 && exec ${invocation}`;
const child = spawn(
  "script",
  ["--quiet", "--return", "--command", command, "/dev/null"],
  {
    stdio: ["pipe", "pipe", "pipe"],
    env: {
      ...process.env,
      TERM: "xterm-256color",
      COLUMNS: "120",
      LINES: "40",
    },
  },
);
let screen = "";
let pending;
let lastAction = 0;
let lastProgress = 0;
let received = 0;
const seen = new Set();
const actions = [];
const write = (text, action) => {
  child.stdin.write(text);
  actions.push(action);
  lastAction = Date.now();
  screen = "";
};
const observe = (chunk) => {
  received += chunk.length;
  const raw = chunk.toString();
  if (raw.includes("\u001b[6n")) child.stdin.write("\u001b[1;1R");
  if (raw.includes("\u001b[c")) child.stdin.write("\u001b[?1;2c");
  if (raw.includes("\u001b]11;?"))
    child.stdin.write("\u001b]11;rgb:0000/0000/0000\u001b\\");
  screen = (screen + chunk.toString())
    .slice(-65_536)
    .replace(/\u001b\][^\u0007]*?(?:\u0007|\u001b\\)/g, "")
    .replace(/\u001b\[[0-?]*[ -/]*[@-~]/g, "");
  if (screen.includes("OUTPOST_TERMINAL_BEGIN")) {
    seen.delete("theme");
    screen = screen.slice(
      screen.indexOf("OUTPOST_TERMINAL_BEGIN") +
        "OUTPOST_TERMINAL_BEGIN".length,
    );
  }
  const input = screen.match(
    /OUTPOST_TERMINAL_(INPUT|INITIAL):([A-Za-z0-9+/=]+)/,
  );
  if (input && !seen.has(input[2])) {
    seen.add(input[2]);
    pending = {
      text: Buffer.from(input[2], "base64").toString(),
      action: input[1] === "INITIAL" ? "initial-input" : "followup",
    };
  }
  if (screen.includes("OUTPOST_TERMINAL_EXIT"))
    pending ??= { text: "/exit", action: "exit", after: Date.now() + 3000 };
};
const forward = (chunk) => child.stdin.write(chunk);
if (process.stdin.isTTY) process.stdin.setRawMode(true);
process.stdin.on("data", forward);
child.stdout.on("data", observe);
child.stderr.on("data", observe);
const timer = setInterval(() => {
  if (Date.now() - lastProgress > 15_000) {
    lastProgress = Date.now();
    console.log(
      JSON.stringify({
        terminalDriver: descriptor.name,
        actions,
        received,
        screen: {
          login: /login|log in|Login|Sign in|authentication/i.test(screen),
          theme: /theme|text style|Dark mode/i.test(screen),
          trust: /trust|safety check/i.test(screen),
          permission: /permission|allow|proceed/i.test(screen),
          ready: /shortcuts|bypass|help/i.test(screen),
          controls: [
            "enter",
            "return",
            "space",
            "ctrl",
            "shift",
            "tab",
            "escape",
            "yes",
            "no",
            "allow once",
            "always allow",
            "approve",
            "select",
            "y/n",
            "update",
            "model",
            "write",
            "read",
            "accept",
          ].filter((word) => screen.toLowerCase().includes(word)),
        },
      }),
    );
  }
  if (Date.now() - lastAction < 1500) return;
  if (/theme|text style|Dark mode/i.test(screen) && !seen.has("theme")) {
    seen.add("theme");
    write("\r", "theme");
    return;
  }
  const compact = screen.replace(/\s/g, "");
  if (
    descriptor.name === "antigravity" &&
    /TermsofService&DataUse/.test(compact) &&
    /\[Done\]/.test(compact)
  ) {
    write(
      `${/\[x\]Yes,Iagree/.test(compact) ? "\r" : ""}\u001b[B\u001b[C\r`,
      "complete-onboarding-without-interaction-data",
    );
    return;
  }
  if (descriptor.name === "antigravity" && />1\.Yes,/.test(compact)) {
    write("\r", "approve-owned-workspace-command-once");
    return;
  }
  if (
    descriptor.name === "kimi" &&
    /approve/i.test(compact) &&
    /select/i.test(compact)
  ) {
    write("\r", "approve-owned-workspace-command");
    return;
  }
  if (/trust|approve/i.test(compact) && /enter(?:to)?select/i.test(compact)) {
    write("\r", "confirm-owned-workspace-choice");
    return;
  }
  if (/Yes,proceed\(y\)/i.test(compact)) {
    write("y", "approve-owned-workspace-command");
    return;
  }
  if (/Yes,Itrust/i.test(compact)) {
    if (/(?:❯|>)Yes,Itrust/i.test(compact)) {
      write("\r", "confirm-trust-owned-workspace");
      return;
    }
    const previous = screen;
    write("\u001b[B", "select-trust-owned-workspace");
    screen = previous;
    return;
  }
  if (
    /PressEnterto(?:continue|send)|Entertoconfirm|Yes,Itrust|Doyouwantto(?:create|edit|proceed|run)|Allowthis/i.test(
      compact,
    )
  ) {
    write("\r", "confirm");
    return;
  }
  if (pending) {
    if (pending.after && Date.now() < pending.after) return;
    if (
      pending.action === "initial-input" &&
      !/shortcuts|\/help|for help/i.test(screen)
    )
      return;
    const { text, action } = pending;
    pending = undefined;
    write(`\u001b[200~${text}\u001b[201~`, action);
    setTimeout(() => write("\r", `${action}-submit`), 250);
  }
}, 500);
const stop = () => child.kill("SIGTERM");
process.once("SIGINT", stop);
process.once("SIGTERM", stop);
child.once("error", () => {
  process.exitCode = 1;
});
child.once("close", (code) => {
  clearInterval(timer);
  process.stdin.removeListener("data", forward);
  process.stdin.pause();
  if (process.stdin.isTTY) process.stdin.setRawMode(false);
  process.removeListener("SIGINT", stop);
  process.removeListener("SIGTERM", stop);
  console.log(
    JSON.stringify({
      terminalDriver: descriptor.name,
      status: code === 0 ? "passed" : "failed",
      actions,
    }),
  );
  process.exitCode = code ?? 1;
});
