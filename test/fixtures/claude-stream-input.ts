import { createInterface } from "node:readline";
import { setTimeout as sleep } from "node:timers/promises";

// Mirrors Claude Code stream-json input observed live: messages read during a tool
// call join the running turn; messages read during the final answer start a new turn.
interface Input {
  readonly message: { readonly content: readonly { readonly text: string }[] };
}

const session = "steer-session";
const done = "<outpost>done</outpost>";
const queue: Input[] = [];
let ended = false;
let busy = false;

const out = (value: object) =>
  process.stdout.write(
    `${JSON.stringify({ ...value, session_id: session })}\n`,
  );
const text = (input: Input) => input.message.content[0]?.text ?? "";
const replay = (input: Input) =>
  out({ type: "user", isReplay: true, message: input.message });

async function turn(first: Input): Promise<void> {
  busy = true;
  out({ type: "system", subtype: "init" });
  replay(first);
  const parts = [`handled: ${text(first)}`];
  if (text(first).includes("use a tool")) {
    out({
      type: "assistant",
      message: {
        content: [
          { type: "tool_use", id: "t1", name: "Bash", input: { command: "x" } },
        ],
      },
    });
    await sleep(400);
    out({
      type: "user",
      message: {
        content: [{ type: "tool_result", tool_use_id: "t1", content: "ok" }],
      },
    });
    for (const injected of queue.splice(0)) {
      replay(injected);
      parts.push(`injected: ${text(injected)}`);
    }
  }
  const answer = `${parts.join(" | ")} ${done}`;
  out({
    type: "assistant",
    message: { content: [{ type: "text", text: answer }] },
  });
  await sleep(400);
  out({
    type: "result",
    subtype: "success",
    is_error: false,
    result: answer,
    usage: { input_tokens: 10, output_tokens: 2 },
  });
  busy = false;
  pump();
}

function pump(): void {
  if (busy) return;
  const next = queue.shift();
  if (next) {
    void turn(next);
    return;
  }
  if (ended) process.exit(0);
}

createInterface({ input: process.stdin })
  .on("line", (line) => {
    queue.push(JSON.parse(line) as Input);
    pump();
  })
  .on("close", () => {
    ended = true;
    pump();
  });
