export interface NativeRecipeFactory {
  readonly kind: string;
  readonly load: () => Promise<unknown>;
  readonly dispose?: "close";
  readonly experimental?: boolean;
}
