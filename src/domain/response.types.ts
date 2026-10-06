import type { JsonSchema, StandardJsonSchema } from "./tool.types.ts";

export interface StandardValidator<T> {
  readonly "~standard": {
    readonly validate: (
      input: unknown,
    ) =>
      | { readonly value: T; readonly issues?: undefined }
      | { readonly issues: readonly unknown[] }
      | Promise<
          | { readonly value: T; readonly issues?: undefined }
          | { readonly issues: readonly unknown[] }
        >;
  };
}

export interface ResponseSpec<T> {
  readonly tag: string;
  readonly repairs: number;
  readonly format?: "json" | "text";
  readonly jsonSchema?: JsonSchema;
  read(text: string): Promise<T>;
}

export type JsonResponseOptions<T> = {
  tag: string;
  repairs?: number;
} & (
  | { schema: StandardJsonSchema<T>; jsonSchema?: JsonSchema }
  | {
      schema: StandardValidator<T> | ((input: unknown) => T | Promise<T>);
      jsonSchema: JsonSchema;
    }
);

export type TextResponseOptions = { tag: string; repairs?: number };

export type StandardResult<T> =
  { readonly value: T } | { readonly issues: readonly unknown[] };

export interface StandardIssue {
  readonly message?: unknown;
  readonly path?: readonly unknown[];
}

export interface StandardPathSegment {
  readonly key?: unknown;
}
