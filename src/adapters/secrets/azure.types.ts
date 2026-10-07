import type { SecretClient } from "@azure/keyvault-secrets";

export interface AzureSecretReference {
  readonly name: string;
  readonly version?: string;
}

export interface AzureSecretSourceOptions {
  readonly client: Pick<SecretClient, "getSecret">;
  readonly secrets: Readonly<Record<string, AzureSecretReference>>;
}
