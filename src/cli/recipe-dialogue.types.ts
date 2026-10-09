export interface RecipeInputPrompts {
  text(message: string, signal: AbortSignal): Promise<string | undefined>;
  select(
    message: string,
    choices: readonly string[],
    signal: AbortSignal,
  ): Promise<number | undefined>;
}

export interface RecipeDialogueOptions {
  readonly actor?: string;
  readonly signal: AbortSignal;
  readonly prompts: RecipeInputPrompts;
  readonly cancel: () => void;
}
