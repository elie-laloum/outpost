// Runs inside the sandbox: checks declared variables, then serves stdio or bridges HTTP.
export const mcpLauncher = `
const { spawn } = require("node:child_process");
const { createInterface } = require("node:readline");
const config = JSON.parse(process.argv[1]);
for (const name of config.variables) {
  if (!process.env[name]) {
    process.stderr.write("Missing " + name + " for MCP server " + config.server + ". Declare it in .outpost/.env or the sandbox provider variables.\\n");
    process.exit(78);
  }
}
if (config.url) bridge();
else serve();

function serve() {
  const child = spawn(config.command, config.arguments, { stdio: "inherit" });
  child.on("error", (error) => {
    process.stderr.write(error.message + "\\n");
    process.exit(127);
  });
  child.on("exit", (code) => process.exit(code ?? 1));
  for (const signal of ["SIGTERM", "SIGINT", "SIGHUP"])
    process.on(signal, () => child.kill(signal));
}

function bridge() {
  const token = config.bearerTokenVariable ? process.env[config.bearerTokenVariable] : undefined;
  let session;
  let version;
  let ordered = Promise.resolve();
  const pending = new Set();
  const write = (message) => process.stdout.write(JSON.stringify(message) + "\\n");
  const deliver = (message) => {
    if (typeof message?.result?.protocolVersion === "string") version = message.result.protocolVersion;
    write(message);
  };
  const fail = (message, text) => {
    if (message.id === undefined) process.stderr.write(text + "\\n");
    else write({ jsonrpc: "2.0", id: message.id, error: { code: -32000, message: text } });
  };
  const headers = () => ({
    ...config.headers,
    ...(token ? { authorization: "Bearer " + token } : {}),
    ...(session ? { "mcp-session-id": session } : {}),
    ...(version ? { "mcp-protocol-version": version } : {}),
  });
  async function events(body) {
    const decoder = new TextDecoder();
    let buffer = "";
    const flush = (block) => {
      const data = block.split(/\\r?\\n/).filter((line) => line.startsWith("data:")).map((line) => line.slice(5).replace(/^ /, "")).join("\\n");
      if (data) deliver(JSON.parse(data));
    };
    for await (const chunk of body) {
      buffer += decoder.decode(chunk, { stream: true });
      let end;
      while ((end = buffer.search(/\\r?\\n\\r?\\n/)) >= 0) {
        flush(buffer.slice(0, end));
        buffer = buffer.slice(end).replace(/^\\r?\\n\\r?\\n/, "");
      }
    }
    flush(buffer + decoder.decode());
  }
  async function post(line) {
    let message;
    try {
      message = JSON.parse(line);
    } catch {
      return;
    }
    try {
      const response = await fetch(config.url, {
        method: "POST",
        headers: { ...headers(), "content-type": "application/json", accept: "application/json, text/event-stream" },
        body: line,
      });
      session = response.headers.get("mcp-session-id") ?? session;
      if (!response.ok) {
        fail(message, "HTTP " + response.status + ": " + (await response.text()).slice(0, 500));
        return;
      }
      const type = response.headers.get("content-type") ?? "";
      if (type.includes("text/event-stream")) await events(response.body);
      else if (type.includes("application/json")) [].concat(await response.json()).forEach(deliver);
      else await response.arrayBuffer();
    } catch (error) {
      fail(message, "MCP HTTP request failed: " + error.message);
    }
  }
  const isRequest = (line) => {
    try {
      return JSON.parse(line).id !== undefined;
    } catch {
      return false;
    }
  };
  const track = (operation) => {
    pending.add(operation);
    operation.finally(() => pending.delete(operation));
  };
  const input = createInterface({ input: process.stdin });
  input.on("line", (line) => {
    // Notifications keep their order; requests may overlap once earlier notifications are sent.
    if (isRequest(line)) track(ordered.then(() => post(line)));
    else track((ordered = ordered.then(() => post(line))));
  });
  input.on("close", async () => {
    await Promise.allSettled([...pending]);
    if (session)
      await fetch(config.url, { method: "DELETE", headers: headers() }).catch(() => undefined);
    process.exit(0);
  });
}
`;
