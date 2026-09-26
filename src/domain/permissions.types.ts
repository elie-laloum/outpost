export type PermissionEffect = "allow" | "deny";

export interface HarnessPermissionRule {
  readonly effect: PermissionEffect;
  readonly tools?: readonly string[];
  readonly paths?: readonly string[];
  readonly commands?: readonly string[];
  readonly reason?: string;
}

export interface HarnessPermissionsOptions {
  readonly rules: readonly HarnessPermissionRule[];
  readonly default?: PermissionEffect;
}

export interface ToolResources {
  readonly paths?: readonly string[];
  readonly command?: string;
}

export type PermissionDecision =
  | { readonly allowed: true }
  | { readonly allowed: false; readonly reason: string };

export interface HarnessPermissions {
  readonly kind: "permissions";
  readonly rules: readonly HarnessPermissionRule[];
  readonly default: PermissionEffect;
  evaluate(tool: string, resources: ToolResources): PermissionDecision;
}

export interface CompiledRule {
  readonly rule: HarnessPermissionRule;
  readonly tools?: readonly RegExp[];
  readonly paths?: readonly RegExp[];
  readonly commands?: readonly RegExp[];
}
