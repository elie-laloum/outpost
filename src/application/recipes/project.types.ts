import type { RecipeRegistry } from "../../domain/recipes/component.types.ts";
import type { RecipeDocument } from "../../domain/recipe.types.ts";
import type { RecipeConfiguration } from "../recipe.types.ts";
import type { RecipeComponentGraph } from "./components.types.ts";
import type { RecipeReport } from "../recipe-report.types.ts";

export interface RecipeProjectOptions {
  readonly file: string;
  readonly config: string;
  readonly registry?: RecipeRegistry;
}

export interface RecipeProjectValidation {
  readonly name: string;
  readonly version: number;
  readonly configurationVersion: number;
  readonly tasks: readonly string[];
  readonly agents: readonly string[];
  readonly extensions: readonly string[];
}

export interface RecipeProject {
  readonly options: RecipeProjectOptions;
  readonly directory: string;
  readonly document: RecipeDocument;
  readonly configuration: Readonly<Record<string, unknown>>;
  readonly legacy: RecipeConfiguration;
  readonly graph: RecipeComponentGraph;
  readonly registry: RecipeRegistry;
  readonly reports: readonly RecipeReportDeclaration[];
}

export interface RecipeReportDeclaration {
  readonly type: "text" | "json";
  readonly stream?: "stdout" | "stderr";
}

export interface RecipeRunOptions {
  readonly inputs?: Readonly<Record<string, string | number | boolean>>;
  readonly signal?: AbortSignal;
  readonly report?: "json";
}

export interface RecipeRuntime {
  run(options?: RecipeRunOptions): Promise<RecipeReport>;
  close(): Promise<void>;
  [Symbol.asyncDispose](): Promise<void>;
}
