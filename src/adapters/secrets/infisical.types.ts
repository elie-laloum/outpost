import type { GetSecretOptions, Secret } from "@infisical/sdk";

export interface InfisicalSecretSourceOptions {
  readonly client: {
    secrets(): {
      getSecret(
        options: GetSecretOptions,
      ): Promise<Pick<Secret, "secretValue" | "secretValueHidden">>;
    };
  };
  readonly projectId: string;
  readonly environment: string;
  readonly path?: string;
}
