// Load only OPENAI_API_KEY from a chosen secret manager before running Codex.
// Set OUTPOST_REPOSITORY and host credentials; run index.ts [vault|onepassword|infisical|aws|gcp|azure].

import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import {
  createAgent,
  createCodexHarness,
  createReporter,
  dispatch,
  fromSecrets,
} from "@elie-laloum/outpost";
import type { SecretSource } from "@elie-laloum/outpost";
import { createDockerSandboxProvider } from "@elie-laloum/outpost/providers/docker";

function required(name: string): string {
  const value = process.env[name];
  assert.ok(value, `Set ${name} on the host before running this example.`);
  return value;
}

const repository = required("OUTPOST_REPOSITORY");
const closeClients: Array<() => void | Promise<void>> = [];
const sources = new Map<string, () => Promise<SecretSource>>([
  [
    "vault",
    async () => {
      const { createVaultSecretSource } =
        await import("@elie-laloum/outpost/secrets/vault");
      return createVaultSecretSource({
        address: required("VAULT_ADDR"),
        token: required("VAULT_TOKEN"),
        mount: process.env.OUTPOST_SECRET_MOUNT ?? "kv",
        path: process.env.OUTPOST_SECRET_PATH ?? "outpost",
      });
    },
  ],
  [
    "onepassword",
    async () => {
      const { createClient } = await import("@1password/sdk");
      const { createOnePasswordSecretSource } =
        await import("@elie-laloum/outpost/secrets/onepassword");
      const client = await createClient({
        auth: required("OP_SERVICE_ACCOUNT_TOKEN"),
        integrationName: "Outpost secret example",
        integrationVersion: "1.0.0",
      });
      return createOnePasswordSecretSource({
        client,
        secrets: { OPENAI_API_KEY: required("OUTPOST_SECRET_REFERENCE") },
      });
    },
  ],
  [
    "infisical",
    async () => {
      const { InfisicalSDK } = await import("@infisical/sdk");
      const { createInfisicalSecretSource } =
        await import("@elie-laloum/outpost/secrets/infisical");
      const client = new InfisicalSDK({
        siteUrl: required("INFISICAL_SITE_URL"),
      });
      await client.auth().universalAuth.login({
        clientId: required("INFISICAL_CLIENT_ID"),
        clientSecret: required("INFISICAL_CLIENT_SECRET"),
      });
      return createInfisicalSecretSource({
        client,
        projectId: required("INFISICAL_PROJECT_ID"),
        environment: required("INFISICAL_ENVIRONMENT"),
        path: process.env.OUTPOST_SECRET_PATH ?? "/outpost",
      });
    },
  ],
  [
    "aws",
    async () => {
      const { SecretsManagerClient } =
        await import("@aws-sdk/client-secrets-manager");
      const { createAwsSecretSource } =
        await import("@elie-laloum/outpost/secrets/aws");
      const client = new SecretsManagerClient({
        region: required("AWS_REGION"),
      });
      closeClients.push(() => client.destroy());
      return createAwsSecretSource({
        client,
        secrets: {
          OPENAI_API_KEY: {
            id: required("OUTPOST_SECRET_ID"),
            ...(process.env.OUTPOST_SECRET_FIELD
              ? { field: process.env.OUTPOST_SECRET_FIELD }
              : {}),
          },
        },
      });
    },
  ],
  [
    "gcp",
    async () => {
      const { SecretManagerServiceClient } =
        await import("@google-cloud/secret-manager");
      const { createGcpSecretSource } =
        await import("@elie-laloum/outpost/secrets/gcp");
      const client = new SecretManagerServiceClient();
      closeClients.push(() => client.close());
      return createGcpSecretSource({
        client,
        secrets: { OPENAI_API_KEY: required("OUTPOST_SECRET_VERSION") },
      });
    },
  ],
  [
    "azure",
    async () => {
      const { SecretClient } = await import("@azure/keyvault-secrets");
      const { DefaultAzureCredential } = await import("@azure/identity");
      const { createAzureSecretSource } =
        await import("@elie-laloum/outpost/secrets/azure");
      const client = new SecretClient(
        required("AZURE_VAULT_URL"),
        new DefaultAzureCredential(),
      );
      return createAzureSecretSource({
        client,
        secrets: { OPENAI_API_KEY: { name: required("OUTPOST_SECRET_NAME") } },
      });
    },
  ],
]);

const service = process.argv[2] ?? "vault";
const createSource = sources.get(service);
assert.ok(
  createSource,
  `Choose a secret source: ${[...sources.keys()].join(", ")}.`,
);
try {
  const variables = await fromSecrets(await createSource(), ["OPENAI_API_KEY"]);
  const result = await dispatch({
    repository,
    agent: createAgent({
      harness: createCodexHarness({ authentication: "usage", variables }),
    }),
    sandboxProvider: createDockerSandboxProvider({ image: "outpost:dev" }),
    branch: { mode: "named", name: `outpost/secrets-${randomUUID()}` },
    observe: createReporter(),
    brief: {
      text: "Summarize this repository. Do not inspect or print credentials.",
    },
  });
  console.log("Task finished; review branch:", result.branch);
} finally {
  for (const close of closeClients) await close();
}
