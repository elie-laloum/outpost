export type RecipeSchemaVisitor = (
  schema: Readonly<Record<string, unknown>>,
  value: unknown,
  path: string,
) => unknown;
