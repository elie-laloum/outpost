import type {
  Observation,
  ObservationHub,
  ObservationSink,
} from "../../domain/observation.types.ts";
import type {
  RecipeComponentDefinition,
  RecipeExtensionDeclaration,
} from "../../domain/recipes/component.types.ts";

export interface RecipeComponentNode {
  readonly name: string;
  readonly kind: string;
  readonly options: Readonly<Record<string, unknown>>;
  readonly definition?: RecipeComponentDefinition;
  readonly extension?: RecipeExtensionDeclaration;
  readonly dependencies: readonly string[];
}

export interface RecipeComponentGraph {
  readonly nodes: ReadonlyMap<string, RecipeComponentNode>;
  readonly observation?: string;
}

export interface RecipeComponentScope {
  readonly observerErrors: readonly unknown[];
  readonly redactions: readonly RegExp[];
  protect(values: readonly string[]): void;
  redact<T>(value: T): T;
  resolve(name: string, kind: string): Promise<unknown>;
  prepare(): Promise<void>;
  close(): Promise<void>;
}

export interface RecipeOwnedComponent {
  readonly kind: string;
  close(): void | Promise<void>;
}

export interface ConsoleSinkOptions {
  readonly format?: "text" | "json";
  readonly stream?: "stdout" | "stderr";
}

export interface ObservationComponentOptions {
  readonly sinks?: readonly { readonly $ref: string }[];
  readonly redact?: readonly string[];
  readonly capacity?: number;
  readonly deliveryTimeoutMs?: number;
  readonly verbose?: boolean;
}

export interface ComponentGuards {
  readonly observation: (value: unknown) => value is ObservationHub;
  readonly sink: (value: unknown) => value is ObservationSink;
}

export type RecipeEventWriter = (observation: Observation) => void;
