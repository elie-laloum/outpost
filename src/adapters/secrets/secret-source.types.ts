import type { SecretResolveOptions } from "../../domain/secrets.types.ts";

export type SecretReader<T> = (
  reference: T,
  options: SecretResolveOptions,
) => Promise<unknown>;
