export type WorkflowJson =
  | null
  | boolean
  | number
  | string
  | readonly WorkflowJson[]
  | { readonly [key: string]: WorkflowJson };

export interface LosslessJsonOptions {
  readonly label?: string;
}
