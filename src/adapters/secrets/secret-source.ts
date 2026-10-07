import { invariant } from "../../domain/errors.ts";
import { secretNames, secretValue } from "../../domain/secrets.ts";
import type { SecretSource } from "../../domain/secrets.types.ts";
import type { SecretReader } from "./secret-source.types.ts";

export function secretText(
  value: unknown,
  label: string,
): asserts value is string {
  invariant(
    typeof value === "string" && value.trim() && !/[\0\r\n]/.test(value),
    `${label} must be nonempty text without control characters`,
  );
}

export function mappedSecretSource<T>(
  name: string,
  references: Readonly<Record<string, T>>,
  read: SecretReader<T>,
): SecretSource {
  invariant(
    references && typeof references === "object" && !Array.isArray(references),
    "Secret references must be a mapping",
  );
  secretNames(Object.keys(references));
  const mapping = Object.freeze({ ...references });
  return Object.freeze<SecretSource>({
    name,
    async resolve(names, options = {}) {
      const selected = secretNames(names);
      for (const key of selected)
        invariant(
          Object.hasOwn(mapping, key),
          `Missing secret reference: ${key}`,
        );
      const entries: [string, string][] = [];
      for (const key of selected) {
        options.signal?.throwIfAborted();
        const reference = mapping[key];
        invariant(reference !== undefined, `Missing secret reference: ${key}`);
        const value = await read(reference, options);
        options.signal?.throwIfAborted();
        entries.push([key, secretValue(value)]);
      }
      return Object.freeze(Object.fromEntries(entries));
    },
  });
}
