import {
  Boxes,
  Bot,
  Braces,
  CircleHelp,
  GitCompare,
  ListOrdered,
  type LucideIcon,
  MessagesSquare,
  Package,
  Repeat,
  ShieldCheck,
  Split,
  SquareFunction,
  Terminal,
} from "lucide-react";
import type { RecipeEditorAction } from "@/lib/types";

export const actionIcons: Readonly<Record<RecipeEditorAction, LucideIcon>> = {
  command: Terminal,
  agent: Bot,
  isolated: Boxes,
  interactive: MessagesSquare,
  value: Braces,
  call: SquareFunction,
  artifact: Package,
  gate: ShieldCheck,
  decision: Split,
  loop: Repeat,
  queued: ListOrdered,
  speculation: GitCompare,
};

export function actionIcon(action: RecipeEditorAction | undefined): LucideIcon {
  return action ? actionIcons[action] : CircleHelp;
}
