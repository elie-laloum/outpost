export interface ConfigurationDiagnostic {
  readonly code: string;
  readonly path: readonly (string | number)[];
  readonly message: string;
  readonly hint?: string;
  readonly file?: string;
  readonly line?: number;
  readonly column?: number;
}
