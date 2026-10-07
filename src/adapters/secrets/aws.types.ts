import type { SecretsManagerClient } from "@aws-sdk/client-secrets-manager";

export interface AwsSecretReference {
  readonly id: string;
  readonly field?: string;
  readonly versionId?: string;
  readonly versionStage?: string;
}

export interface AwsSecretSourceOptions {
  readonly client: Pick<SecretsManagerClient, "send">;
  readonly secrets: Readonly<Record<string, AwsSecretReference>>;
}
