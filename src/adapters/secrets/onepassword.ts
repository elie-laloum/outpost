import { invariant } from "../../domain/errors.ts";
import type { SecretSource } from "../../domain/secrets.types.ts";
import { mappedSecretSource, secretText } from "./secret-source.ts";
import type { OnePasswordSecretSourceOptions } from "./onepassword.types.ts";

export type { OnePasswordSecretSourceOptions } from "./onepassword.types.ts";

export function createOnePasswordSecretSource(
  options: OnePasswordSecretSourceOptions,
): SecretSource {
  invariant(
    typeof options.client?.secrets?.resolve === "function",
    "1Password secret client must provide secrets.resolve",
  );
  for (const ref of Object.values(options.secrets)) {
    secretText(ref, "1Password secret reference");
    invariant(
      /^op:\/\/[^/]+\/[^/]+\/(?:[^/]+\/)?[^/?#]+$/.test(ref),
      "1Password secret reference must use op://vault/item/field or op://vault/item/section/field",
    );
  }
  const client = options.client;
  return mappedSecretSource("onepassword", options.secrets, (reference) =>
    client.secrets.resolve(reference),
  );
}
