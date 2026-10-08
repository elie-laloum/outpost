import type { JsonSchema } from "../tool.types.ts";

export interface RecipeComponentContext {
  readonly directory: string;
  readonly signal: AbortSignal;
  resolve(name: string, kind: string): Promise<unknown>;
  environment(name: string): string;
}

export interface RecipeComponentDefinition {
  readonly name: string;
  readonly kind: string;
  readonly schema: JsonSchema;
  readonly experimental?: boolean;
  create(
    options: Readonly<Record<string, unknown>>,
    context: RecipeComponentContext,
  ): unknown | Promise<unknown>;
  accepts(value: unknown): boolean;
  dispose?(value: unknown): void | Promise<void>;
}

export interface RecipeRegistry {
  readonly components: readonly RecipeComponentDefinition[];
  get(name: string): RecipeComponentDefinition;
}

export interface RecipeRegistryOptions {
  readonly components?: readonly RecipeComponentDefinition[];
}

export interface RecipeComponentDeclaration {
  readonly type: string;
  readonly options: Readonly<Record<string, unknown>>;
}

export interface RecipeExtensionDeclaration {
  readonly module: string;
  readonly export: string;
  readonly kind: string;
  readonly version: string;
  readonly factory?: boolean;
  readonly schema?: JsonSchema;
  readonly options?: Readonly<Record<string, unknown>>;
  readonly dispose?: string;
}
