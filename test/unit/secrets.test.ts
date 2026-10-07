import assert from "node:assert/strict";
import { test, mock } from "node:test";
import { inspect } from "node:util";
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import { SecretClient } from "@azure/keyvault-secrets";
import { fromSecrets, OutpostError } from "../../src/index.ts";
import type { SecretSource } from "../../src/index.ts";
import { createAwsSecretSource } from "../../src/adapters/secrets/aws.ts";
import { createGcpSecretSource } from "../../src/adapters/secrets/gcp.ts";
import { createAzureSecretSource } from "../../src/adapters/secrets/azure.ts";
import { createOnePasswordSecretSource } from "../../src/adapters/secrets/onepassword.ts";
import { createInfisicalSecretSource } from "../../src/adapters/secrets/infisical.ts";
import { createVaultSecretSource } from "../../src/adapters/secrets/vault.ts";

const fault = (code: string) => (error: unknown) =>
  error instanceof OutpostError && error.code === code;
const source = (
  values: Readonly<Record<string, string | undefined>>,
): SecretSource => ({ name: "fixture", resolve: async () => values });

test("secret resolution selects declared names, snapshots names and returns immutable variables without touching process.env", async () => {
  const names = ["OUTPOST_TEST_KEY"];
  const previous = process.env.OUTPOST_TEST_KEY;
  const result = await fromSecrets(
    {
      name: "fixture",
      async resolve(selected, options) {
        assert.deepEqual(selected, ["OUTPOST_TEST_KEY"]);
        assert.ok(Object.isFrozen(selected));
        assert.ok(options?.signal);
        names.push("OTHER");
        return { OUTPOST_TEST_KEY: "value\nline", OTHER: "must not escape" };
      },
    },
    names,
  );
  assert.deepEqual(result, { OUTPOST_TEST_KEY: "value\nline" });
  assert.ok(Object.isFrozen(result));
  assert.equal(process.env.OUTPOST_TEST_KEY, previous);
  assert.deepEqual(
    await fromSecrets(
      {
        name: "fixture",
        resolve: async () => {
          throw Error("must not read");
        },
      },
      [],
    ),
    {},
  );
});

test("invalid declarations and deadlines fail before reading a secret", async () => {
  const resolve = mock.fn(async () => ({}));
  const fixture = { name: "fixture", resolve };
  for (const names of [
    ["bad-name"],
    ["X", "X"],
    [""],
    ["1KEY"],
    new Array<string>(1),
  ])
    await assert.rejects(fromSecrets(fixture, names), fault("configuration"));
  for (const timeoutMs of [0, -1, Infinity, 0.5, 2_147_483_648])
    await assert.rejects(
      fromSecrets(fixture, ["X"], { timeoutMs }),
      fault("configuration"),
    );
  await assert.rejects(
    fromSecrets({ name: "", resolve }, ["X"]),
    fault("configuration"),
  );
  assert.equal(resolve.mock.callCount(), 0);
});

test("missing, empty, nontext, inherited, accessor and oversized values reject without leaking values", async () => {
  for (const value of [undefined, "", "bad\0value", "x".repeat(1_048_577)])
    await assert.rejects(
      fromSecrets(source({ KEY: value }), ["KEY"]),
      fault("provider"),
    );
  await assert.rejects(
    fromSecrets(source(Object.create({ KEY: "inherited" })), ["KEY"]),
    /Missing declared secret: KEY/,
  );
  await assert.rejects(
    fromSecrets(
      source(
        Object.defineProperty({}, "KEY", {
          get() {
            throw Error("secret getter");
          },
        }),
      ),
      ["KEY"],
    ),
    /data properties/,
  );
  for (const returned of [null, [], "sensitive", { KEY: 42 }]) {
    const resolve = mock.fn(async () => returned);
    // The fixture models an invalid external implementation of the port.
    const fixture = { name: "fixture", resolve: async () => ({}) };
    Object.assign(fixture, { resolve });
    await assert.rejects(fromSecrets(fixture, ["KEY"]), fault("provider"));
  }
});

test("vendor exception bodies, causes and cancellation reasons stay out of public faults", async () => {
  const privateValue = "fixture-credential-never-print";
  for (const thrown of [
    Error(privateValue),
    new OutpostError(
      "provider",
      privateValue,
      { body: privateValue },
      Error(privateValue),
    ),
  ]) {
    await assert.rejects(
      fromSecrets(
        {
          name: "fixture",
          resolve: async () => {
            throw thrown;
          },
        },
        ["KEY"],
      ),
      (error) => {
        assert.equal(inspect(error).includes(privateValue), false);
        assert.ok(error instanceof OutpostError);
        assert.equal(error.code, "provider");
        assert.equal(error.cause, undefined);
        return true;
      },
    );
  }
  const controller = new AbortController();
  controller.abort(privateValue);
  await assert.rejects(
    fromSecrets(source({}), ["KEY"], { signal: controller.signal }),
    fault("aborted"),
  );
});

test("timeouts and cancellation bound a source that ignores its signal and stop subsequent reads", async () => {
  const controller = new AbortController();
  let activeSignal: AbortSignal | undefined;
  const hanging: SecretSource = {
    name: "fixture",
    resolve: async (_, options) => {
      activeSignal = options?.signal;
      return new Promise(() => {});
    },
  };
  await assert.rejects(
    fromSecrets(hanging, ["KEY"], { timeoutMs: 10 }),
    fault("timeout"),
  );
  assert.ok(activeSignal?.aborted);
  const pending = fromSecrets(hanging, ["KEY"], { signal: controller.signal });
  controller.abort("private reason");
  await assert.rejects(pending, fault("aborted"));
  const calls: string[] = [];
  const cancel = new AbortController();
  const mapped = createOnePasswordSecretSource({
    client: {
      secrets: {
        async resolve(ref) {
          calls.push(ref);
          cancel.abort();
          return "value";
        },
      },
    },
    secrets: {
      FIRST: "op://vault/item/first",
      SECOND: "op://vault/item/second",
    },
  });
  await assert.rejects(
    fromSecrets(mapped, ["FIRST", "SECOND"], { signal: cancel.signal }),
    fault("aborted"),
  );
  assert.deepEqual(calls, ["op://vault/item/first"]);
});

test("1Password reads mapped references only and checks the full selection before any read", async () => {
  const resolve = mock.fn(async () => "value");
  const secrets = {
    KEY: "op://vault/item/section/field",
    OTHER: "op://vault/item/other",
  };
  const fixture = createOnePasswordSecretSource({
    client: { secrets: { resolve } },
    secrets,
  });
  secrets.KEY = "op://changed/item/field";
  assert.deepEqual(await fromSecrets(fixture, ["KEY"]), { KEY: "value" });
  assert.deepEqual(resolve.mock.calls[0]?.arguments, [
    "op://vault/item/section/field",
  ]);
  await assert.rejects(
    fixture.resolve(["KEY", "MISSING"]),
    fault("configuration"),
  );
  assert.equal(resolve.mock.callCount(), 1);
  await assert.rejects(
    fromSecrets(fixture, ["KEY", "MISSING"]),
    fault("configuration"),
  );
  assert.deepEqual(await fixture.resolve([]), {});
  assert.throws(
    () =>
      createOnePasswordSecretSource({
        client: { secrets: { resolve } },
        secrets: { KEY: "op://vault/item" },
      }),
    fault("configuration"),
  );
});

test("AWS forwards an exact id/version, selects JSON fields and refuses binary, invalid JSON and missing fields", async (t) => {
  const client = new SecretsManagerClient({
    region: "us-east-1",
    credentials: { accessKeyId: "fixture", secretAccessKey: "fixture" },
  });
  t.after(() => client.destroy());
  let response: object = { SecretString: '{"key":"value","other":"hidden"}' };
  const send = mock.method(client, "send", async () => response);
  t.after(() => send.mock.restore());
  const secrets = {
    KEY: {
      id: "outpost/api",
      field: "key",
      versionId: "version",
      versionStage: "AWSCURRENT",
    },
  };
  const fixture = createAwsSecretSource({ client, secrets });
  secrets.KEY.id = "changed";
  assert.deepEqual(await fromSecrets(fixture, ["KEY"]), { KEY: "value" });
  const request = send.mock.calls[0]?.arguments[0];
  assert.ok(request instanceof GetSecretValueCommand);
  assert.deepEqual(request.input, {
    SecretId: "outpost/api",
    VersionId: "version",
    VersionStage: "AWSCURRENT",
  });
  assert.ok(send.mock.calls[0]?.arguments[1]?.abortSignal);
  for (const next of [
    { SecretBinary: Buffer.from("binary") },
    { SecretString: "malformed-private" },
    { SecretString: "[]" },
    { SecretString: '{"other":"private"}' },
    { SecretString: '{"key":42}' },
  ]) {
    response = next;
    await assert.rejects(fromSecrets(fixture, ["KEY"]), fault("provider"));
  }
  response = { SecretString: "plain" };
  assert.deepEqual(
    await fromSecrets(
      createAwsSecretSource({ client, secrets: { KEY: { id: "plain" } } }),
      ["KEY"],
    ),
    { KEY: "plain" },
  );
  assert.throws(
    () => createAwsSecretSource({ client, secrets: { KEY: { id: "" } } }),
    fault("configuration"),
  );
});

test("GCP decodes bytes and REST base64, selects exact versions and refuses absent or invalid UTF-8", async (t) => {
  const client = new SecretManagerServiceClient({ fallback: true });
  t.after(() => client.close());
  let response: object = { payload: { data: Buffer.from("value") } };
  const read = mock.method(client, "accessSecretVersion", async () => [
    response,
  ]);
  t.after(() => read.mock.restore());
  const fixture = createGcpSecretSource({
    client,
    secrets: { KEY: "projects/demo/secrets/api/versions/latest" },
  });
  assert.deepEqual(await fromSecrets(fixture, ["KEY"]), { KEY: "value" });
  assert.deepEqual(read.mock.calls[0]?.arguments, [
    { name: "projects/demo/secrets/api/versions/latest" },
  ]);
  response = { payload: { data: Buffer.from("other").toString("base64") } };
  assert.deepEqual(await fromSecrets(fixture, ["KEY"]), { KEY: "other" });
  for (const next of [
    {},
    { payload: { data: new Uint8Array([0xff]) } },
    { payload: { data: "dmFsdWU=ignored" } },
  ]) {
    response = next;
    await assert.rejects(fromSecrets(fixture, ["KEY"]), fault("provider"));
  }
  assert.throws(
    () =>
      createGcpSecretSource({
        client,
        secrets: { KEY: "projects/demo/secrets/api" },
      }),
    fault("configuration"),
  );
});

test("Azure forwards the selected name/version and cancellation signal without reading other mappings", async (t) => {
  const client = new SecretClient("https://fixture.vault.azure.net", {
    getToken: async () => null,
  });
  const read = mock.method(client, "getSecret", async () => ({
    value: "value",
  }));
  t.after(() => read.mock.restore());
  const fixture = createAzureSecretSource({
    client,
    secrets: {
      KEY: { name: "openai-key", version: "v1" },
      OTHER: { name: "other" },
    },
  });
  assert.deepEqual(await fromSecrets(fixture, ["KEY"]), { KEY: "value" });
  assert.equal(read.mock.calls[0]?.arguments[0], "openai-key");
  assert.equal(read.mock.calls[0]?.arguments[1]?.version, "v1");
  assert.ok(read.mock.calls[0]?.arguments[1]?.abortSignal);
  assert.deepEqual(
    await fromSecrets(
      createAzureSecretSource({ client, secrets: { KEY: { name: "key" } } }),
      ["KEY"],
    ),
    { KEY: "value" },
  );
  assert.throws(
    () =>
      createAzureSecretSource({
        client,
        secrets: { KEY: { name: "bad_name" } },
      }),
    fault("configuration"),
  );
});

test("Infisical reads selected names in one explicit project/environment/path with imports and expansion disabled", async () => {
  const getSecret = mock.fn(async () => ({
    secretValue: "value",
    secretValueHidden: false,
  }));
  const client = { secrets: () => ({ getSecret }) };
  const fixture = createInfisicalSecretSource({
    client,
    projectId: "project",
    environment: "prod",
    path: "/outpost",
  });
  assert.deepEqual(await fromSecrets(fixture, ["KEY"]), { KEY: "value" });
  assert.deepEqual(getSecret.mock.calls[0]?.arguments, [
    {
      projectId: "project",
      environment: "prod",
      secretPath: "/outpost",
      secretName: "KEY",
      expandSecretReferences: false,
      includeImports: false,
      viewSecretValue: true,
    },
  ]);
  assert.deepEqual(
    await fromSecrets(
      createInfisicalSecretSource({
        client,
        projectId: "project",
        environment: "dev",
      }),
      ["KEY"],
    ),
    { KEY: "value" },
  );
  assert.throws(
    () =>
      createInfisicalSecretSource({
        client,
        projectId: "project",
        environment: "dev",
        path: "../secrets",
      }),
    fault("configuration"),
  );
  await assert.rejects(
    fromSecrets(
      createInfisicalSecretSource({
        client: {
          secrets: () => ({
            getSecret: async () => ({
              secretValue: "hidden",
              secretValueHidden: true,
            }),
          }),
        },
        projectId: "project",
        environment: "dev",
      }),
      ["KEY"],
    ),
    fault("provider"),
  );
});

test("Vault validates URL, path, version and header configuration before HTTP", () => {
  const options = {
    address: "https://vault.example",
    token: "fixture",
    mount: "kv",
    path: "outpost",
  };
  for (const address of [
    "not a url",
    "file:///tmp/secrets",
    "https://user:pass@vault.example",
    "https://vault.example?token=value",
    "https://vault.example#fragment",
  ])
    assert.throws(
      () => createVaultSecretSource({ ...options, address }),
      fault("configuration"),
    );
  for (const path of ["../secret", "/secret", "a//b", "a/./b"])
    assert.throws(
      () => createVaultSecretSource({ ...options, path }),
      fault("configuration"),
    );
  assert.throws(
    () => createVaultSecretSource({ ...options, token: "a\nb" }),
    fault("configuration"),
  );
  assert.throws(
    () => createVaultSecretSource({ ...options, version: 0 }),
    fault("configuration"),
  );
});
