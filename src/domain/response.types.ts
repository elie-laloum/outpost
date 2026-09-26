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
  read(text: string): Promise<T>;
}

export type JsonResponseOptions<T> = {
  tag: string;
  schema: StandardValidator<T> | ((input: unknown) => T | Promise<T>);
  repairs?: number;
};

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
