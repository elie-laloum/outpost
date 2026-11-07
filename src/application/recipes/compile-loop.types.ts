import type { WorkflowJson } from "../../domain/workflow/checkpoint.types.ts";

/** JSON result of a declarative loop round, as projected into recipe outputs. */
export type RecipeLoopOutput = Readonly<Record<string, WorkflowJson>>;
