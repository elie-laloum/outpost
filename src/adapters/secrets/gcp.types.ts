import type { SecretManagerServiceClient } from "@google-cloud/secret-manager";

export interface GcpSecretSourceOptions {
  readonly client: Pick<SecretManagerServiceClient, "accessSecretVersion">;
  readonly secrets: Readonly<Record<string, string>>;
}
