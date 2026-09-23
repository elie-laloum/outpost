export type VariableQuestion = (
  key: string,
  signal?: AbortSignal,
) => Promise<string>;
