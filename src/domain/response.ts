import { OutpostError, invariant } from "./errors.ts";

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

export class ResponseError extends OutpostError {
  readonly tag: string;
  readonly raw: string | undefined;
  constructor(tag: string, message: string, raw?: string, cause?: unknown) {
    super("response", message, { tag, raw }, cause);
    this.name = "ResponseError";
    this.tag = tag;
    this.raw = raw;
  }
}

function content(text: string, tag: string): string {
  const matches = [
    ...text.matchAll(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "g")),
  ];
  if (!matches.length)
    throw new ResponseError(tag, `No complete <${tag}> response was found`);
  return matches.at(-1)![1]!.trim();
}

function spec<T>(
  tag: string,
  repairs: number,
  parse: (text: string) => Promise<T>,
): ResponseSpec<T> {
  invariant(
    /^[A-Za-z][A-Za-z0-9_-]*$/.test(tag),
    "Response tags must be XML-style identifiers",
  );
  invariant(
    Number.isSafeInteger(repairs) && repairs >= 0,
    "Response repairs must be a nonnegative integer",
  );
  return Object.freeze({
    tag,
    repairs,
    async read(text: string) {
      const raw = content(text, tag);
      try {
        return await parse(raw);
      } catch (cause) {
        throw new ResponseError(
          tag,
          `Invalid <${tag}> response: ${cause instanceof Error ? cause.message : String(cause)}`,
          raw,
          cause,
        );
      }
    },
  });
}

export const response = {
  text: (options: { tag: string; repairs?: number }): ResponseSpec<string> =>
    spec(options.tag, options.repairs ?? 0, async (text) => text),
  json: <T>(options: {
    tag: string;
    schema: StandardValidator<T> | ((input: unknown) => T | Promise<T>);
    repairs?: number;
  }): ResponseSpec<T> =>
    spec(options.tag, options.repairs ?? 0, async (text) => {
      const fenced = text.match(/^```(?:json)?\s*\r?\n([\s\S]*?)\r?\n```$/i);
      const input: unknown = JSON.parse(fenced ? fenced[1]! : text);
      if (typeof options.schema === "function") return options.schema(input);
      const result = await options.schema["~standard"].validate(input);
      if (result.issues) throw new Error(JSON.stringify(result.issues));
      return result.value;
    }),
};
