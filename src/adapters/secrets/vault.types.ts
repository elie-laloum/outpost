export interface VaultSecretSourceOptions {
  readonly address: string;
  readonly token: string;
  readonly mount: string;
  readonly path: string;
  readonly version?: number;
  readonly namespace?: string;
}
