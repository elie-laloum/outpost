import { readFileSync } from "node:fs";

const event = JSON.parse(readFileSync(0, "utf8"));
if (typeof event.prompt !== "string") throw new Error("Expected a prompt");
process.stdout.write(
  JSON.stringify({
    prompt: `${event.prompt}\nRead README.md before answering.`,
  }),
);
