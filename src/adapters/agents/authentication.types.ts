import type {
  CredentialPlan,
  HostCredential,
} from "../../domain/agent.types.ts";
import type { AuthenticationForm } from "../../domain/authentication.types.ts";
import type { Variables } from "../../domain/command.types.ts";
import type { AgentModel } from "../../domain/model.types.ts";

export interface CredentialInput {
  readonly value: string;
  readonly model?: AgentModel;
}

export type CredentialPlanner = (variables: Variables) => CredentialPlan;

export type CredentialRecipe = (input: CredentialInput) => CredentialPlanner;

export type CredentialStrategy = Readonly<
  Partial<Record<AuthenticationForm, CredentialRecipe>>
>;

export interface VariableCredentialOptions {
  readonly variable: string;
  accept?(secret: string): void;
  bind?(input: CredentialInput): void;
  expose?(secret: string, input: CredentialInput): Partial<CredentialPlan>;
}

export interface HostFileOptions extends HostCredential {
  readonly files?: CredentialPlan["files"];
}
