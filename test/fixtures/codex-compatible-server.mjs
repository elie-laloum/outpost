const request = JSON.parse(process.argv[1]);
const args = [...request.arguments];
args.splice(args.indexOf("exec") + 1, 0, "--skip-git-repo-check");
import { createServer } from "node:http";
import { spawn } from "node:child_process";
const item = {
  id: "msg_test",
  type: "message",
  role: "assistant",
  status: "completed",
  content: [
    { type: "output_text", text: "OUTPOST_COMPATIBLE_OK", annotations: [] },
  ],
};
let requests = 0;
const server = createServer(async (req, res) => {
  let body = "";
  for await (const part of req) body += part;
  if (!req.url.endsWith("/responses")) {
    res.writeHead(404);
    res.end();
    return;
  }
  requests++;
  const input = JSON.parse(body);
  if (input.model !== "fixture-model") {
    res.writeHead(400);
    res.end();
    return;
  }
  res.writeHead(200, { "Content-Type": "text/event-stream" });
  const events = [
    {
      type: "response.created",
      response: { id: "resp_test", status: "in_progress", output: [] },
    },
    {
      type: "response.output_item.added",
      output_index: 0,
      item: { ...item, content: [], status: "in_progress" },
    },
    {
      type: "response.output_text.delta",
      item_id: "msg_test",
      output_index: 0,
      content_index: 0,
      delta: "OUTPOST_COMPATIBLE_OK",
    },
    { type: "response.output_item.done", output_index: 0, item },
    {
      type: "response.completed",
      response: {
        id: "resp_test",
        status: "completed",
        output: [item],
        usage: { input_tokens: 1, output_tokens: 1, total_tokens: 2 },
      },
    },
  ];
  for (const e of events)
    res.write("event: " + e.type + "\ndata: " + JSON.stringify(e) + "\n\n");
  res.end();
});
await new Promise((resolve) => server.listen(18181, "127.0.0.1", resolve));
const child = spawn("codex", args, { stdio: ["pipe", "inherit", "inherit"] });
child.stdin.end(request.stdin);
child.on("exit", (code) => {
  server.close();
  process.exitCode = code || (!requests ? 1 : 0);
});
