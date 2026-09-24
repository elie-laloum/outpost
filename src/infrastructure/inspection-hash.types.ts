export interface InspectionHash {
  readonly kind: "file" | "symlink";
  readonly bytes: number;
  readonly sha256: string;
}
