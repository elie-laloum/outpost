import { Box, Folder, FolderGit2, Plus, SlidersHorizontal } from "lucide-react";
import type { ReactNode } from "react";
import { recipeEditorFeatures } from "../../../../src/domain/recipes/editor-scene.constants.ts";
import { workspaceTemplates } from "@/lib/scene-templates";
import { useEditor } from "@/lib/store";
import { taskTemplates } from "@/lib/templates";
import type {
  PaletteItem,
  RecipeEditorAction,
  RecipeEditorFeature,
} from "@/lib/types";
import { actionIcons } from "./action-icons";
import { familyIcon } from "./entity-node";

export const paletteDragType = "application/x-outpost-palette";

const groups = ["Run", "Data", "Control", "Scale"] as const;
const actions = Object.keys(taskTemplates) as RecipeEditorAction[];
const features = Object.keys(recipeEditorFeatures) as RecipeEditorFeature[];

export function paletteItem(transfer: DataTransfer): PaletteItem | undefined {
  const data = transfer.getData(paletteDragType);
  if (!data) return undefined;
  try {
    return JSON.parse(data) as PaletteItem;
  } catch {
    return undefined;
  }
}

function Entry({
  item,
  icon,
  label,
  description,
  disabled,
  onAdd,
}: {
  readonly item: PaletteItem;
  readonly icon: ReactNode;
  readonly label: string;
  readonly description: string;
  readonly disabled: boolean;
  readonly onAdd: (item: PaletteItem) => void;
}) {
  return (
    <button
      type="button"
      draggable={!disabled}
      disabled={disabled}
      onDragStart={(event) => {
        event.dataTransfer.setData(paletteDragType, JSON.stringify(item));
        event.dataTransfer.effectAllowed = "copy";
      }}
      onClick={() => onAdd(item)}
      title={description}
      className="group flex items-center gap-2 border border-transparent px-2 py-1.5 text-left text-sm hover:border-border hover:bg-card disabled:pointer-events-none disabled:opacity-40"
    >
      {icon}
      <span className="flex-1 truncate">{label}</span>
      <Plus className="size-3.5 opacity-0 group-hover:opacity-60" aria-hidden />
    </button>
  );
}

function Group({
  title,
  open = true,
  children,
}: {
  readonly title: string;
  readonly open?: boolean;
  readonly children: ReactNode;
}) {
  return (
    <details open={open} className="flex flex-col gap-1">
      <summary className="cursor-pointer px-1 text-[0.6875rem] font-medium tracking-wide text-muted-foreground uppercase select-none">
        {title}
      </summary>
      <div className="mt-1 flex flex-col gap-1">{children}</div>
    </details>
  );
}

const iconClass = "size-4 shrink-0 text-primary";

/** Tasks, zones, features and components to drag onto the canvas, or click to add beside the selection. */
export function Palette({
  disabled,
  onAdd,
}: {
  readonly disabled: { readonly recipe: boolean; readonly config: boolean };
  readonly onAdd: (item: PaletteItem) => void;
}) {
  const compatibility = useEditor((store) => store.info?.compatibility);
  const providers = Object.keys(compatibility?.providers ?? {});
  const families = Object.keys(compatibility?.families ?? {});
  const entry = (
    item: PaletteItem,
    icon: ReactNode,
    label: string,
    description: string,
  ) => (
    <Entry
      key={JSON.stringify(item)}
      item={item}
      icon={icon}
      label={label}
      description={description}
      disabled={item.type === "task" ? disabled.recipe : disabled.config}
      onAdd={onAdd}
    />
  );
  return (
    <aside
      className="flex w-56 shrink-0 flex-col gap-4 overflow-y-auto border-r bg-background p-3"
      aria-label="Palette"
    >
      {groups.map((group) => (
        <Group key={group} title={group}>
          {actions
            .filter((action) => taskTemplates[action].group === group)
            .map((action) => {
              const Icon = actionIcons[action];
              const template = taskTemplates[action];
              return entry(
                { type: "task", action },
                <Icon className={iconClass} aria-hidden />,
                template.label,
                template.description,
              );
            })}
        </Group>
      ))}
      <Group title="Zones">
        {Object.keys(workspaceTemplates).map((value) => {
          const Icon = value === "git" ? FolderGit2 : Folder;
          return entry(
            { type: "zone", kind: "workspace", value },
            <Icon className={iconClass} aria-hidden />,
            `${value} workspace`,
            "Files that sandboxes open; drop it on the canvas",
          );
        })}
        {providers.map((value) =>
          entry(
            { type: "zone", kind: "sandbox", value },
            <Box className={iconClass} aria-hidden />,
            `${value} sandbox`,
            "Runs command and agent tasks; drop it in a workspace",
          ),
        )}
      </Group>
      <Group title="Features">
        {features.map((feature) =>
          entry(
            { type: "feature", feature },
            <SlidersHorizontal className={iconClass} aria-hidden />,
            feature,
            `Drop it on a ${recipeEditorFeatures[feature].zone} zone`,
          ),
        )}
      </Group>
      <Group title="Components" open={false}>
        {families.map((family) => {
          const Icon = familyIcon(family);
          return entry(
            { type: "component", family },
            <Icon className={iconClass} aria-hidden />,
            family,
            `Declare an entry of ${family} in the configuration`,
          );
        })}
      </Group>
    </aside>
  );
}
