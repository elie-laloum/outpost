import type { Variables } from "../../domain/command.types.ts";

export interface GeminiSettings {
  readonly model?: string;
  readonly variables?: Variables;
  readonly approvalMode?: "default" | "auto_edit" | "yolo" | "plan";
}
