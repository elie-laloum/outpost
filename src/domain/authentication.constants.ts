import type { AuthenticationForm } from "./authentication.types.ts";

export const authenticationForms: readonly AuthenticationForm[] = [
  "account",
  "account.file",
  "account.key",
  "account.variable",
  "usage",
  "usage.key",
  "usage.variable",
];

export const VARIABLE_NAME = /^[A-Za-z_][A-Za-z0-9_]*$/;
