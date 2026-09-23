export type PromptVariables = Readonly<
  Record<string, string | number | boolean>
>;

export type Brief =
  | { readonly text: string; readonly file?: never; readonly values?: never }
  | {
      readonly file: string;
      readonly text?: never;
      readonly values?: PromptVariables;
    };

export interface PromptFragment {
  readonly kind: "literal" | "command";
  readonly value: string;
}

export type PreparedBrief = {
  fragments: readonly PromptFragment[];
  unused: readonly string[];
};

export type PromptBuiltins = { WORK_BRANCH: string; BASE_BRANCH: string };
