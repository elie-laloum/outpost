import { Plus } from "lucide-react";
import { taskTemplates } from "@/lib/templates";
import type { RecipeEditorAction } from "@/lib/types";
import { actionIcons } from "./action-icons";

export const taskDragType = "application/x-outpost-task";

const groups = ["Run", "Data", "Control", "Scale"] as const;
const actions = Object.keys(taskTemplates) as RecipeEditorAction[];

/** Task kinds to drag onto the canvas, or click to append after the selected task. */
export function Palette({
  disabled,
  onAdd,
}: {
  readonly disabled: boolean;
  readonly onAdd: (action: RecipeEditorAction) => void;
}) {
  return (
    <aside
      className="flex w-56 shrink-0 flex-col gap-4 overflow-y-auto border-r bg-background p-3"
      aria-label="Task kinds"
    >
      {groups.map((group) => (
        <section key={group} className="flex flex-col gap-1">
          <h2 className="px-1 text-[0.6875rem] font-medium tracking-wide text-muted-foreground uppercase">
            {group}
          </h2>
          {actions
            .filter((action) => taskTemplates[action].group === group)
            .map((action) => {
              const Icon = actionIcons[action];
              const template = taskTemplates[action];
              return (
                <button
                  key={action}
                  type="button"
                  draggable={!disabled}
                  disabled={disabled}
                  onDragStart={(event) => {
                    event.dataTransfer.setData(taskDragType, action);
                    event.dataTransfer.effectAllowed = "copy";
                  }}
                  onClick={() => onAdd(action)}
                  title={template.description}
                  className="group flex items-center gap-2 border border-transparent px-2 py-1.5 text-left text-sm hover:border-border hover:bg-card disabled:pointer-events-none disabled:opacity-40"
                >
                  <Icon className="size-4 text-primary" aria-hidden />
                  <span className="flex-1">{template.label}</span>
                  <Plus
                    className="size-3.5 opacity-0 group-hover:opacity-60"
                    aria-hidden
                  />
                </button>
              );
            })}
        </section>
      ))}
    </aside>
  );
}
