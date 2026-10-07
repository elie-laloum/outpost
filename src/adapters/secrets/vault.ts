import { invariant, OutpostError, positive } from "../../domain/errors.ts";
import { secretNames, secretValue } from "../../domain/secrets.ts";
import type { SecretSource } from "../../domain/secrets.types.ts";
import { secretText } from "./secret-source.ts";
import { readVaultDocument } from "./vault-response.ts";
import type { VaultSecretSourceOptions } from "./vault.types.ts";

export type { VaultSecretSourceOptions } from "./vault.types.ts";

function pathSegments(value: string): string {
  secretText(value, "Vault path");
  const parts = value.split("/");
  invariant(
    parts.every((part) => part && part !== "." && part !== ".."),
    "Vault path must have nonempty segments without traversal",
  );
  return parts.map(encodeURIComponent).join("/");
}

export function createVaultSecretSource(
  options: VaultSecretSourceOptions,
): SecretSource {
  let base: URL;
  try {
    base = new URL(options.address);
  } catch {
    throw new OutpostError(
      "configuration",
      "Vault address must be an absolute HTTP(S) URL",
    );
  }
  invariant(
    ["https:", "http:"].includes(base.protocol) &&
      !base.username &&
      !base.password &&
      !base.search &&
      !base.hash,
    "Vault address must use HTTP(S) without credentials, query or fragment",
  );
  secretText(options.token, "Vault token");
  if (options.namespace !== undefined)
    secretText(options.namespace, "Vault namespace");
  const endpoint = new URL(
    `${base.href.replace(/\/+$/, "")}/v1/${pathSegments(options.mount)}/data/${pathSegments(options.path)}`,
  );
  if (options.version !== undefined)
    endpoint.searchParams.set(
      "version",
      String(positive(options.version, "Vault version")),
    );
  const headers = Object.freeze({
    "X-Vault-Token": options.token,
    "X-Vault-Request": "true",
    ...(options.namespace === undefined
      ? {}
      : { "X-Vault-Namespace": options.namespace }),
  });
  return Object.freeze<SecretSource>({
    name: "vault",
    async resolve(names, settings = {}) {
      const selected = secretNames(names);
      settings.signal?.throwIfAborted();
      if (!selected.length) return Object.freeze({});
      const response = await fetch(endpoint, {
        headers,
        redirect: "error",
        ...(settings.signal ? { signal: settings.signal } : {}),
      });
      if (!response.ok) {
        await response.body?.cancel();
        throw new OutpostError(
          "provider",
          `Vault read failed with HTTP ${response.status}`,
        );
      }
      const document = await readVaultDocument(response);
      return Object.freeze(
        Object.fromEntries(
          selected.map((key) => [
            key,
            Object.hasOwn(document, key)
              ? secretValue(Reflect.get(document, key))
              : undefined,
          ]),
        ),
      );
    },
  });
}
