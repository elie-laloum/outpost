import { invariant } from "../../domain/errors.ts";
import type { SecretSource } from "../../domain/secrets.types.ts";
import { mappedSecretSource, secretText } from "./secret-source.ts";
import type { AzureSecretSourceOptions } from "./azure.types.ts";

export type {
  AzureSecretSourceOptions,
  AzureSecretReference,
} from "./azure.types.ts";

export function createAzureSecretSource(
  options: AzureSecretSourceOptions,
): SecretSource {
  invariant(
    typeof options.client?.getSecret === "function",
    "Azure secret client must provide getSecret",
  );
  const secrets = Object.fromEntries(
    Object.entries(options.secrets).map(([key, ref]) => {
      secretText(ref.name, "Azure secret name");
      invariant(
        /^[A-Za-z0-9-]+$/.test(ref.name),
        "Azure secret name must use letters, digits or hyphens",
      );
      if (ref.version !== undefined)
        secretText(ref.version, "Azure secret version");
      return [key, Object.freeze({ ...ref })];
    }),
  );
  const client = options.client;
  return mappedSecretSource(
    "azure-key-vault",
    secrets,
    async (reference, settings) => {
      const response = await client.getSecret(reference.name, {
        ...(reference.version === undefined
          ? {}
          : { version: reference.version }),
        ...(settings.signal ? { abortSignal: settings.signal } : {}),
      });
      return response.value;
    },
  );
}
