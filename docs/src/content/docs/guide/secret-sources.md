---
title: "Load secrets from a service"
description: "Resolve declared API keys on the host with Vault, OpenBao, 1Password, Infisical or a cloud secret manager."
---

## Resolve before allocating a sandbox

Call `fromSecrets()` at the start of your script, then pass its result as `variables` on a CLI harness or sandbox provider. It returns a frozen object containing only the requested names. Outpost does not write these values to an environment file or change `process.env`.

The resolver rejects a missing, empty, non-string, NUL-containing or oversized value before your script reaches sandbox allocation. Variable names must be valid environment identifiers and cannot repeat. A value can contain line breaks and is limited to 1 MiB. See [environment variables](../environment-variables/) for scope and precedence, and [setup](../setup/) for the agent image.

## Use Vault or OpenBao

Both services use the KV v2 read API. Declare the server, token, mount and document path explicitly; this example reads the `OPENAI_API_KEY` field from the `kv/outpost` document. A version and namespace can be supplied when needed. The token remains on the host.

```ts title="vault.ts"
import { fromSecrets } from "@elie-laloum/outpost";
import { createVaultSecretSource } from "@elie-laloum/outpost/secrets/vault";

export const variables = await fromSecrets(
  createVaultSecretSource({
    address: process.env.VAULT_ADDR ?? "https://vault.example.com",
    token: process.env.VAULT_TOKEN ?? "",
    mount: "kv",
    path: "outpost",
  }),
  ["OPENAI_API_KEY"],
);
```

Run the following as `node run.ts` after configuring the host token and address. It resolves the key before `dispatch()` allocates a sandbox and leaves the agent's changes on a named branch. `authentication: "usage"` uses API billing, independently of the secret manager's authentication.

```ts title="run.ts"
import {
  createAgent,
  createCodexHarness,
  dispatch,
} from "@elie-laloum/outpost";
import { repository, sandboxProvider } from "./outpost.config.ts";
import { variables } from "./vault.ts";

await dispatch({
  repository,
  sandboxProvider,
  branch: { mode: "named", name: "outpost/secret-source" },
  agent: createAgent({
    harness: createCodexHarness({ authentication: "usage", variables }),
  }),
  brief: { text: "Summarize this repository without reading credentials." },
});
```

KV v2 returns the whole document to the host; Outpost keeps only the selected fields. Store unrelated credentials in separate documents when they must never be fetched together. OpenBao support covers this read protocol, rather than every Vault feature. See the official [Vault API](https://developer.hashicorp.com/vault/api-docs/secret/kv/kv-v2) and [OpenBao API](https://openbao.org/api-docs/).

## Use 1Password

Install `@1password/sdk` in your script project and create a service-account client on the host. Map each environment variable to an explicit `op://vault/item/field` reference; a section can also appear before the field. Only requested mappings are resolved. Use this source with `fromSecrets(source, ["OPENAI_API_KEY"])` instead of the Vault source above.

```ts title="onepassword.ts"
import { createClient } from "@1password/sdk";
import { createOnePasswordSecretSource } from "@elie-laloum/outpost/secrets/onepassword";

const client = await createClient({
  auth: process.env.OP_SERVICE_ACCOUNT_TOKEN ?? "",
  integrationName: "Outpost workflow",
  integrationVersion: "1.0.0",
});
export const source = createOnePasswordSecretSource({
  client,
  secrets: { OPENAI_API_KEY: "op://Automation/OpenAI/api-key" },
});
```

This setup uses a declared service account, without selecting desktop authentication. See the official [1Password SDK documentation](https://www.1password.dev/sdks) for account permissions and SDK platform requirements.

## Use Infisical

Install `@infisical/sdk`, then authenticate a machine identity on the host with Universal Auth. The client's `siteUrl` selects the cloud region or your own instance. Outpost reads each requested name from the declared project, environment and path; it disables imports and reference expansion to keep the selection explicit.

```ts title="infisical.ts"
import { InfisicalSDK } from "@infisical/sdk";
import { createInfisicalSecretSource } from "@elie-laloum/outpost/secrets/infisical";

const client = new InfisicalSDK({ siteUrl: "https://eu.infisical.com" });
await client.auth().universalAuth.login({
  clientId: process.env.INFISICAL_CLIENT_ID ?? "",
  clientSecret: process.env.INFISICAL_CLIENT_SECRET ?? "",
});
export const source = createInfisicalSecretSource({
  client,
  projectId: "your-project-id",
  environment: "prod",
  path: "/outpost",
});
```

Pass this `source` to `fromSecrets()` before composing the agent. Hidden secret values reject the resolution. Other machine-authentication methods can be configured through your client; Outpost owns neither login nor token renewal. See the official [Infisical SDK documentation](https://infisical.com/docs/sdks/languages/node).

## Use AWS Secrets Manager

Install `@aws-sdk/client-secrets-manager`. Configure its client with your host AWS identity and map variables to exact secret IDs or ARNs. A mapping without `field` uses the complete `SecretString`; this example selects one field from a JSON secret. Binary secrets are refused. Optional version selectors belong to [AwsSecretReference](../../reference/awssecretreference/).

```ts title="aws.ts"
import { SecretsManagerClient } from "@aws-sdk/client-secrets-manager";
import { createAwsSecretSource } from "@elie-laloum/outpost/secrets/aws";

export const client = new SecretsManagerClient({ region: "eu-west-3" });
export const source = createAwsSecretSource({
  client,
  secrets: { OPENAI_API_KEY: { id: "outpost/prod", field: "openai" } },
});
```

Resolve with `fromSecrets(source, ["OPENAI_API_KEY"])` and call `client.destroy()` when finished with the client. Like Vault, selecting a JSON field still fetches the enclosing secret. See [AWS's retrieval guide](https://docs.aws.amazon.com/secretsmanager/latest/userguide/retrieving-secrets-javascript.html).

## Use Google Cloud Secret Manager

Install `@google-cloud/secret-manager` and configure Application Default Credentials on the host or use your workload identity. Map variables to complete version resource names, including `latest` or a numeric version; regional resource names are also accepted. Outpost decodes the payload as UTF-8 and refuses invalid text.

```ts title="gcp.ts"
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import { createGcpSecretSource } from "@elie-laloum/outpost/secrets/gcp";

export const client = new SecretManagerServiceClient();
export const source = createGcpSecretSource({
  client,
  secrets: {
    OPENAI_API_KEY: "projects/demo/secrets/openai/versions/latest",
  },
});
```

Resolve before dispatch and `await client.close()` when no longer needed. The official [version-access guide](https://docs.cloud.google.com/secret-manager/docs/access-secret-version) explains the required permissions.

## Use Azure Key Vault

Install `@azure/keyvault-secrets` and `@azure/identity`. Create a host client using a managed identity or another explicitly configured Azure credential. Map environment identifiers to Key Vault names, which can contain hyphens; each mapping can pin a version.

```ts title="azure.ts"
import { DefaultAzureCredential } from "@azure/identity";
import { SecretClient } from "@azure/keyvault-secrets";
import { createAzureSecretSource } from "@elie-laloum/outpost/secrets/azure";

const client = new SecretClient(
  "https://your-vault.vault.azure.net",
  new DefaultAzureCredential(),
);
export const source = createAzureSecretSource({
  client,
  secrets: { OPENAI_API_KEY: { name: "openai-api-key" } },
});
```

Only the selected names are passed to `getSecret()`. See [Azure's JavaScript quickstart](https://learn.microsoft.com/en-us/azure/key-vault/secrets/quick-create-node) for the identity and role setup.

## Bound startup and refresh explicitly

`fromSecrets()` defaults to a 30-second deadline for the complete resolution. Set `timeoutMs` and pass an `AbortSignal` for another startup policy. A cancelled resolution rejects with code `aborted`, a deadline with `timeout`, a read failure or invalid value with `provider`, and invalid declarations with `configuration`. Vendor exceptions and their causes are discarded to avoid exposing credentials through diagnostics.

Vault HTTP, AWS and Azure receive the cancellation signal. For 1Password, GCP and Infisical, cancellation stops waiting and prevents subsequent reads, but an already-started SDK request may finish in the background. Authentication you perform before `fromSecrets()` has its own SDK timeout policy. You own all injected clients; Outpost never closes them.

Values are a startup snapshot: a retry or warm sandbox reuse keeps them. Call `fromSecrets()` again and compose a new agent or sandbox when you want to use rotated values. Outpost adds no persistent cache, automatic renewal or fallback between secret managers. Each SDK is an optional peer dependency and is loaded through the service's entry point or your script, independently of the core import.

:::caution
Agents and commands can read every variable they receive. Resolving a key from a service does not hide it from the chosen agent. Keep the manager's own credentials on the host and avoid logging the returned object. Host execution also inherits the host environment; see [security boundaries](../security/).
:::

## Implement another source

Implement `SecretSource` with a named `resolve()` method that reads only its requested names. This offline example demonstrates selection without an account or network. Use `fromSecrets()` as the validation and startup boundary before handing the variables to a harness.

```ts
import { fromSecrets, type SecretSource } from "@elie-laloum/outpost";
import { reportValue } from "./reporter.ts";

const source: SecretSource = {
  name: "fixture",
  async resolve(names, { signal } = {}) {
    signal?.throwIfAborted();
    return Object.fromEntries(names.map((name) => [name, "fixture-value"]));
  },
};
const variables = await fromSecrets(source, ["EXAMPLE_KEY"]);
if (Object.keys(variables).length !== 1)
  throw new Error("Unexpected selection");
reportValue(Object.keys(variables));
```

<!-- check:run -->

## Validation limits

Deterministic tests cover the KV v2 HTTP protocol, native SDK method boundaries, selection, cancellation, deadlines, malformed values and error sanitization. They do not establish successful authentication against live Vault, OpenBao, 1Password, Infisical, AWS, GCP or Azure accounts. Run the service you use with a dedicated identity before relying on its configuration in production.

API: [fromSecrets](../../reference/fromsecrets/) · [SecretSource](../../reference/secretsource/) · [FromSecretsOptions](../../reference/fromsecretsoptions/).
