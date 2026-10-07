export interface SecretResolveOptions {
  readonly signal?: AbortSignal;
}

export interface SecretSource {
  readonly name: string;
  resolve(
    names: readonly string[],
    options?: SecretResolveOptions,
  ): Promise<Readonly<Record<string, string | undefined>>>;
}

export interface FromSecretsOptions extends SecretResolveOptions {
  readonly timeoutMs?: number;
}
