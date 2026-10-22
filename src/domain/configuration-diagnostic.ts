import type { ConfigurationDiagnostic } from "./configuration-diagnostic.types.ts";

export class ConfigurationError extends Error {
  readonly diagnostic: ConfigurationDiagnostic;
  constructor(diagnostic: ConfigurationDiagnostic, options?: ErrorOptions) {
    super(diagnostic.message, options);
    this.name = "ConfigurationError";
    this.diagnostic = Object.freeze({
      ...diagnostic,
      path: Object.freeze([...diagnostic.path]),
    });
  }
}

export function configurationPath(label: string): readonly (string | number)[] {
  return label
    .replace(/^recipe\./, "")
    .replace(/\[(\d+)\]/g, ".$1")
    .split(".")
    .filter(Boolean)
    .map((key) => (/^\d+$/.test(key) ? Number(key) : key));
}

export function configurationError(
  message: string,
  path: string | readonly (string | number)[],
  code = "invalid-configuration",
  hint?: string,
): ConfigurationError {
  return new ConfigurationError({
    code,
    path: typeof path === "string" ? configurationPath(path) : path,
    message,
    ...(hint === undefined ? {} : { hint }),
  });
}

export function configurationInvariant(
  condition: unknown,
  message: string,
  path: string | readonly (string | number)[],
  code = "invalid-configuration",
  hint?: string,
): asserts condition {
  if (!condition) throw configurationError(message, path, code, hint);
}

/** Locates an error raised by a lower-level validator at the value it checked. */
export function locateConfiguration<T>(
  path: string | readonly (string | number)[],
  read: () => T,
): T {
  try {
    return read();
  } catch (error) {
    if (error instanceof ConfigurationError) throw error;
    const located = configurationError(
      error instanceof Error ? error.message : String(error),
      path,
    );
    throw new ConfigurationError(located.diagnostic, { cause: error });
  }
}
