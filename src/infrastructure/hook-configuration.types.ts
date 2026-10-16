export type HookConfigurationEdit = {
  readonly path: string;
} & (
  | { readonly kind: "exclusive"; readonly content: string }
  | {
      readonly kind: "append";
      readonly content: string;
      readonly rejectPattern?: string;
    }
  | { readonly kind: "entry"; readonly key: string; readonly value: unknown }
);
