import type {
  AgentAdapter,
  AgentAuthentication,
  CredentialPlan,
  HostCredentialPath,
} from "../../domain/agent.types.ts";
import { authenticationForm } from "../../domain/authentication.ts";
import type { Command, Variables } from "../../domain/command.types.ts";
import { invariant } from "../../domain/errors.ts";
import type { AgentModel } from "../../domain/model.types.ts";
import { credentialRecipes } from "./authentication.constants.ts";
import type {
  CredentialPlanner,
  CredentialRecipe,
  CredentialStrategy,
  HostFileOptions,
  VariableCredentialOptions,
} from "./authentication.types.ts";

export function credentialPlan(
  plan: Partial<CredentialPlan> = {},
): CredentialPlan {
  return Object.freeze({
    variables: Object.freeze({ ...plan.variables }),
    host: Object.freeze([...(plan.host ?? [])]),
    files: Object.freeze([...(plan.files ?? [])]),
    commands: Object.freeze([...(plan.commands ?? [])]),
  });
}

export function toolCommand(
  binary: string,
  args: readonly string[],
  options: Pick<Command, "stdin" | "deadlineMs"> = {},
): Command {
  return {
    executable: "node",
    arguments: ["-e", credentialRecipes.tool, binary, ...args],
    ...options,
  };
}

export function requiredVariable(variables: Variables, name: string): string {
  const value = variables[name];
  invariant(
    value,
    `Missing ${name}. Declare the selected credential explicitly.`,
  );
  return value;
}

export function variableCredential(
  options: VariableCredentialOptions,
): Readonly<Record<"preset" | "key" | "variable", CredentialRecipe>> {
  const recipe =
    (read: (value: string, variables: Variables) => string): CredentialRecipe =>
    (input) => {
      options.bind?.(input);
      return (variables) => {
        const secret = read(input.value, variables);
        options.accept?.(secret);
        const exposed = options.expose?.(secret, input) ?? {};
        return credentialPlan({
          ...exposed,
          variables: { [options.variable]: secret, ...exposed.variables },
        });
      };
    };
  return {
    preset: recipe((_, variables) =>
      requiredVariable(variables, options.variable),
    ),
    key: (input) => {
      options.accept?.(input.value);
      return recipe((value) => value)(input);
    },
    variable: recipe((value, variables) => requiredVariable(variables, value)),
  };
}

export function hostFile(
  options: HostFileOptions,
): Readonly<Record<"preset" | "file", CredentialRecipe>> {
  const { files, source, ...credential } = options;
  const recipe =
    (path: HostCredentialPath): CredentialPlanner =>
    () =>
      credentialPlan({
        host: [{ ...credential, source: path }],
        ...(files ? { files } : {}),
      });
  return {
    preset: () => recipe(source),
    file: (input) => recipe({ path: input.value }),
  };
}

export function excluding(
  recipe: CredentialRecipe,
  variable: string,
  message: string,
): CredentialRecipe {
  return (input) => {
    const planFor = recipe(input);
    return (variables) => {
      invariant(!variables[variable], message);
      return planFor(variables);
    };
  };
}

export function credentialPlanner(
  agent: string,
  strategy: CredentialStrategy,
  authentication: AgentAuthentication | undefined,
  model?: AgentModel,
): AgentAdapter["credentials"] {
  if (authentication === undefined) return undefined;
  const { form, value = "" } = authenticationForm(authentication);
  const recipe = Object.hasOwn(strategy, form) ? strategy[form] : undefined;
  const accepted = Object.keys(strategy);
  invariant(
    recipe,
    `${agent} does not support ${form} authentication. Accepted forms: ${accepted.length ? accepted.join(", ") : "none"}`,
  );
  return recipe(model === undefined ? { value } : { value, model });
}
