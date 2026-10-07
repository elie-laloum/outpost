export interface ScriptedRecipe {
  readonly events: readonly string[];
  readonly status: number;
  readonly stderr: string;
  readonly commit?: {
    readonly message: string;
    readonly files: Readonly<Record<string, string | null>>;
  };
}
