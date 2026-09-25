import assert from "node:assert/strict";
import { createServer } from "node:http";
import { once } from "node:events";
import { test } from "node:test";
import { openaiCompatible } from "../../src/index.ts";

const completion = {
  choices: [
    {
      finish_reason: "stop",
      message: { role: "assistant", content: " Héllo\n" },
    },
  ],
  usage: { prompt_tokens: 5, completion_tokens: 3 },
};

test("direct model HTTP contracts, cancellation, deadlines and reuse", async (t) => {
  const requests: {
    url: string | undefined;
    authorization: string | undefined;
    body: Record<string, unknown>;
  }[] = [];
  let mode = "success";
  const server = createServer(async (request, response) => {
    let body = "";
    for await (const chunk of request) body += chunk;
    requests.push({
      url: request.url,
      authorization: request.headers.authorization,
      body: JSON.parse(body),
    });
    if (mode === "hang") return;
    if (mode === "partial") {
      response.writeHead(200);
      response.write('{"unfinished":');
      return;
    }
    if (mode === "disconnect") {
      response.destroy();
      return;
    }
    if (mode === "redirect") {
      response.writeHead(307, { Location: "/stolen" });
      response.end();
      return;
    }
    if (mode === "error") {
      response.writeHead(429);
      response.end("secret-key prompt body");
      return;
    }
    if (mode === "bad-json") {
      response.end("secret-key not-json");
      return;
    }
    if (mode === "responses") {
      response.end(
        JSON.stringify({
          status: "completed",
          output: [
            {
              type: "message",
              role: "assistant",
              status: "completed",
              content: [{ type: "output_text", text: "direct" }],
            },
          ],
          usage: { input_tokens: 4, output_tokens: 1 },
        }),
      );
      return;
    }
    response.end(JSON.stringify(completion));
  });
  t.after(() => {
    server.closeAllConnections();
    server.close();
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const baseUrl = `http://127.0.0.1:${address.port}/prefix/v1/`;
  const provider = openaiCompatible({
    baseUrl,
    model: "vendor/model",
    apiKey: "secret-key",
    timeoutMs: 2_000,
  });
  assert.deepEqual(
    await provider.generate({
      prompt: "hello",
      system: "brief",
      maxOutputTokens: 12,
    }),
    { text: " Héllo\n", usage: { input: 5, output: 3, cached: 0 } },
  );
  assert.deepEqual(requests[0], {
    url: "/prefix/v1/chat/completions",
    authorization: "Bearer secret-key",
    body: {
      model: "vendor/model",
      messages: [
        { role: "system", content: "brief" },
        { role: "user", content: "hello" },
      ],
      stream: false,
      store: false,
      max_completion_tokens: 12,
    },
  });
  mode = "responses";
  const direct = openaiCompatible({
    baseUrl,
    model: "model",
    apiKey: false,
    api: "responses",
  });
  assert.equal(
    (
      await direct.generate({
        prompt: "question",
        system: "instructions",
        maxOutputTokens: 8,
      })
    ).text,
    "direct",
  );
  assert.deepEqual(requests.at(-1), {
    url: "/prefix/v1/responses",
    authorization: undefined,
    body: {
      model: "model",
      input: "question",
      instructions: "instructions",
      stream: false,
      store: false,
      max_output_tokens: 8,
    },
  });
  await direct.generate({ prompt: "minimal" });
  assert.deepEqual(requests.at(-1)?.body, {
    model: "model",
    input: "minimal",
    stream: false,
    store: false,
  });
  const beforeAbort = requests.length;
  await assert.rejects(
    provider.generate({
      prompt: "never sent",
      signal: AbortSignal.abort("secret-key"),
    }),
    { code: "aborted" },
  );
  assert.equal(requests.length, beforeAbort);
  for (const failure of ["error", "redirect", "disconnect", "bad-json"]) {
    mode = failure;
    const before = requests.length;
    await assert.rejects(
      provider.generate({ prompt: "secret prompt" }),
      (error: unknown) => {
        assert.ok(error instanceof Error);
        assert.doesNotMatch(
          JSON.stringify(error) + error.message,
          /secret-key|secret prompt/,
        );
        if (failure === "error") assert.match(error.message, /HTTP 429/);
        return true;
      },
    );
    assert.equal(
      requests.length,
      before + 1,
      "No retries or redirect requests",
    );
  }
  for (const hanging of ["hang", "partial"]) {
    mode = hanging;
    const bounded = openaiCompatible({
      baseUrl,
      model: "model",
      apiKey: false,
      timeoutMs: 50,
    });
    await assert.rejects(bounded.generate({ prompt: "timeout" }), {
      code: "timeout",
    });
    const controller = new AbortController();
    const started = once(server, "request");
    const pending = provider.generate({
      prompt: "cancel",
      signal: controller.signal,
    });
    const rejected = assert.rejects(pending, { code: "aborted" });
    await started;
    controller.abort();
    await rejected;
  }
  mode = "success";
  assert.equal((await provider.generate({ prompt: "reuse" })).text, " Héllo\n");
  assert.deepEqual(requests.at(-1)?.body, {
    model: "vendor/model",
    messages: [{ role: "user", content: "reuse" }],
    stream: false,
    store: false,
  });
  const bounded = openaiCompatible({
    baseUrl,
    model: "model",
    apiKey: false,
    maxResponseBytes: 5,
  });
  await assert.rejects(
    bounded.generate({ prompt: "too big" }),
    /maxResponseBytes/,
  );
});
