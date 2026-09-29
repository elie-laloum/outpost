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
  const authorization = authorizer();
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
      const send = async () =>
        fetch(config.url, {
          method: "POST",
          headers: { ...(await authorization.headers()), ...headers(), "content-type": "application/json", accept: "application/json, text/event-stream" },
          body: line,
        });
      let response = await send();
      if (await authorization.retry(response)) {
        await response.arrayBuffer();
        response = await send();
      }
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
      await authorization
        .headers()
        .then((credentials) => fetch(config.url, { method: "DELETE", headers: { ...credentials, ...headers() } }))
        .catch(() => undefined);
    process.exit(0);
  });
}

function authorizer() {
  const bearer = config.bearerTokenVariable ? process.env[config.bearerTokenVariable] : undefined;
  const auth = config.oauth;
  if (!auth)
    return {
      headers: async () => (bearer ? { authorization: "Bearer " + bearer } : {}),
      retry: async () => false,
    };
  const id = process.env[auth.clientIdVariable];
  const secret = process.env[auth.clientSecretVariable];
  const target = new URL(config.url);
  target.hash = "";
  const resource = target.toString();
  let token;
  let expiresAt = 0;
  let pending;
  let endpoint;
  let methods;
  let challengeScope;
  const read = async (url) => {
    const response = await fetch(url, { headers: { accept: "application/json" } });
    if (!response.ok) throw new Error("HTTP " + response.status + " from " + url);
    return response.json();
  };
  const first = async (urls) => {
    for (const url of urls) {
      try {
        return await read(url);
      } catch {}
    }
    throw new Error("OAuth metadata was not found at " + urls.join(", "));
  };
  const wellKnown = (base, names) => {
    const url = new URL(base);
    const path = url.pathname.replace(/\\/$/, "");
    return names.flatMap((name) => (path ? [url.origin + "/.well-known/" + name + path] : [])).concat(
      path ? [url.origin + path + "/.well-known/openid-configuration"] : names.map((name) => url.origin + "/.well-known/" + name),
    );
  };
  async function discover(challenge) {
    const metadata = /resource_metadata="([^"]+)"/.exec(challenge ?? "")?.[1];
    challengeScope = /scope="([^"]+)"/.exec(challenge ?? "")?.[1] ?? challengeScope;
    const protectedResource = await first(
      metadata ? [metadata] : wellKnown(config.url, ["oauth-protected-resource"]).filter((url) => !url.endsWith("openid-configuration")).concat(new URL(config.url).origin + "/.well-known/oauth-protected-resource"),
    );
    const issuer = protectedResource.authorization_servers?.[0];
    if (typeof issuer !== "string") throw new Error("Protected resource metadata names no authorization server");
    const server = await first(wellKnown(issuer, ["oauth-authorization-server", "openid-configuration"]));
    if (typeof server.token_endpoint !== "string") throw new Error("Authorization server metadata has no token_endpoint");
    endpoint = server.token_endpoint;
    methods = server.token_endpoint_auth_methods_supported ?? ["client_secret_basic"];
  }
  async function request(challenge) {
    if (!endpoint || challenge) await discover(challenge);
    const scope = auth.scopes?.join(" ") ?? challengeScope;
    const body = new URLSearchParams({ grant_type: "client_credentials", resource, ...(scope ? { scope } : {}) });
    const headers = { "content-type": "application/x-www-form-urlencoded", accept: "application/json" };
    if (methods.includes("client_secret_basic"))
      headers.authorization = "Basic " + Buffer.from(encodeURIComponent(id) + ":" + encodeURIComponent(secret)).toString("base64");
    else if (methods.includes("client_secret_post")) {
      body.set("client_id", id);
      body.set("client_secret", secret);
    } else throw new Error("The authorization server supports neither client_secret_basic nor client_secret_post");
    const response = await fetch(endpoint, { method: "POST", headers, body });
    const text = await response.text();
    if (!response.ok) throw new Error("OAuth token request failed with HTTP " + response.status + ": " + text.slice(0, 300));
    const result = JSON.parse(text);
    if (typeof result.access_token !== "string") throw new Error("OAuth token response has no access_token");
    const lifetime = Number(result.expires_in);
    token = result.access_token;
    expiresAt = Number.isFinite(lifetime) && lifetime > 0 ? Date.now() + lifetime * 1000 - Math.min(30000, lifetime * 500) : Infinity;
  }
  const refresh = (challenge) => (pending ??= request(challenge).finally(() => { pending = undefined; }));
  return {
    async headers() {
      if (!token || Date.now() >= expiresAt) await refresh();
      return { authorization: "Bearer " + token };
    },
    async retry(response) {
      if (response.status !== 401) return false;
      token = undefined;
      await refresh(response.headers.get("www-authenticate") ?? undefined);
      return true;
    },
  };
}
`;
