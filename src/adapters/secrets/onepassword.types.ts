import type { Client } from "@1password/sdk";

export interface OnePasswordSecretSourceOptions {
  readonly client: { readonly secrets: Pick<Client["secrets"], "resolve"> };
  readonly secrets: Readonly<Record<string, string>>;
}
