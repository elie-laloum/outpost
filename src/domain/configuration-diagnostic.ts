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
): ConfigurationError {
  return new ConfigurationError({
    code,
    path: typeof path === "string" ? configurationPath(path) : path,
    message,
  });
}
