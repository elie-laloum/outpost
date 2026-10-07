export interface DiffGuard {
  readonly protectedPaths?: readonly string[];
  readonly maxChangedLines?: number;
}

export interface DiffChange {
  readonly paths: readonly string[];
  readonly added: number;
  readonly removed: number;
  readonly binary: boolean;
}
