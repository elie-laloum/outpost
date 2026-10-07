import { invariant, OutpostError } from "../../domain/errors.ts";
import { secretNames, secretValue } from "../../domain/secrets.ts";
import type { SecretSource } from "../../domain/secrets.types.ts";
import { secretText } from "./secret-source.ts";
import type { InfisicalSecretSourceOptions } from "./infisical.types.ts";

export type { InfisicalSecretSourceOptions } from "./infisical.types.ts";

export function createInfisicalSecretSource(
  options: InfisicalSecretSourceOptions,
): SecretSource {
  invariant(
    typeof options.client?.secrets === "function",
    "Infisical client must provide secrets",
  );
  secretText(options.projectId, "Infisical projectId");
  secretText(options.environment, "Infisical environment");
  const path = options.path ?? "/";
  secretText(path, "Infisical path");
  invariant(
    path.startsWith("/") &&
      !path.split("/").some((segment) => segment === "." || segment === ".."),
    "Infisical path must be absolute without traversal",
  );
  const projectId = options.projectId;
  const environment = options.environment;
  const client = options.client;
  return Object.freeze<SecretSource>({
    name: "infisical",
    async resolve(names, settings = {}) {
      const selected = secretNames(names);
      const entries: [string, string][] = [];
      for (const name of selected) {
        settings.signal?.throwIfAborted();
        const secret = await client.secrets().getSecret({
          projectId,
          environment,
          secretPath: path,
          secretName: name,
          expandSecretReferences: false,
          includeImports: false,
          viewSecretValue: true,
        });
        settings.signal?.throwIfAborted();
        if (secret.secretValueHidden)
          throw new OutpostError(
            "provider",
            "Infisical secret value is hidden",
          );
        entries.push([name, secretValue(secret.secretValue)]);
      }
      return Object.freeze(Object.fromEntries(entries));
    },
  });
}
