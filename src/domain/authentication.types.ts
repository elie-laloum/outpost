export type AuthenticationForm =
  | "account"
  | "account.file"
  | "account.key"
  | "account.variable"
  | "usage"
  | "usage.key"
  | "usage.variable";

export interface AuthenticationSelection {
  readonly form: AuthenticationForm;
  readonly value?: string;
}
