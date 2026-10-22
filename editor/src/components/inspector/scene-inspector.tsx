import { Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { diagnosticsByNode } from "@/lib/diagnostics";
import type { RecipeEditorEntity, RecipeEditorZone } from "@/lib/types";
import { useRecipe } from "@/lib/use-recipe";
import { familyIcon } from "../canvas/entity-node";
import { zoneLabel } from "../canvas/zone-node";
import { record } from "./action-forms";
import { TextField, YamlField, removed } from "./fields";
import { Problems } from "./problems";

const namePattern = {
  test: /^[A-Za-z0-9_-]+$/,
  message: "Use letters, digits, dashes and underscores.",
};

function at(value: unknown, path: readonly (string | number)[]): unknown {
  return path.reduce<unknown>(
    (current, part) => record(current)[String(part)],
    value,
  );
}

function Header({
  icon,
  title,
  onRemove,
  removable,
}: {
  readonly icon: ReactNode;
  readonly title: string;
  readonly onRemove: () => void;
  readonly removable: boolean;
}) {
  return (
    <header className="flex items-center gap-2">
      {icon}
      <h2 className="flex-1 truncate text-sm font-medium">{title}</h2>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`Delete ${title}`}
        disabled={!removable}
        onClick={onRemove}
      >
        <Trash2 />
      </Button>
    </header>
  );
}

/** A workspace or sandbox: its name, its declaration and the features it holds. */
export function ZoneInspector({ zone }: { readonly zone: RecipeEditorZone }) {
  const { state, editScene, edit, select, configEditable } = useRecipe();
  const id = `zone:${zone.id}`;
  const problems = diagnosticsByNode(state?.diagnostics ?? []).get(id) ?? [];
  const family = zone.kind === "workspace" ? "workspaces" : "sandboxes";
  return (
    <fieldset disabled={!configEditable} className="flex flex-col gap-4">
      <Header
        icon={
          <span className="text-[0.6875rem] tracking-wide text-muted-foreground uppercase">
            {zone.kind}
          </span>
        }
        title={zoneLabel(zone)}
        removable={zone.declared}
        onRemove={() => {
          void editScene([{ type: "remove-zone", zone: zone.id }]);
          select(undefined);
        }}
      />
      <Problems problems={problems} />
      {zone.name && (
        <TextField
          label="Name"
          mono
          value={zone.name}
          pattern={namePattern}
          hint="Renaming updates the tasks and sandboxes that use it."
          onCommit={(to) => {
            if (to === removed || to === zone.name) return;
            void editScene([{ type: "rename-zone", zone: zone.id, to }]).then(
              (renamed) => renamed && select(`zone:${family}.${to}`),
            );
          }}
        />
      )}
      <p className="text-xs text-muted-foreground">
        {zone.kind === "workspace"
          ? "Sandboxes inside this zone open its files; drag one here to switch the workspace it opens."
          : "Command and agent tasks inside this zone run in its sandbox; drag a task to another sandbox to change its provider."}
      </p>
      <Separator />
      <YamlField
        label="Declaration"
        hint={`Configuration ${zone.path.join(".")}; features dropped on the zone appear here.`}
        value={at(state?.config?.value, zone.path)}
        onCommit={(value) =>
          void edit("config", [
            {
              type: "set",
              path: [...zone.path],
              ...(value === removed ? {} : { value }),
            },
          ])
        }
      />
    </fieldset>
  );
}

/** A named configuration component and the declaration that `$ref` fields select. */
export function EntityInspector({
  entity,
}: {
  readonly entity: RecipeEditorEntity;
}) {
  const { state, scene, editScene, edit, select, configEditable } = useRecipe();
  const id = `entity:${entity.id}`;
  const problems = diagnosticsByNode(state?.diagnostics ?? []).get(id) ?? [];
  const Icon = familyIcon(entity.family);
  const users = (scene?.references ?? []).filter(
    (reference) => reference.target === entity.id,
  );
  return (
    <fieldset disabled={!configEditable} className="flex flex-col gap-4">
      <Header
        icon={<Icon className="size-4 text-primary" aria-hidden />}
        title={entity.id}
        removable={!users.length}
        onRemove={() => {
          void editScene([{ type: "remove-entity", entity: entity.id }]);
          select(undefined);
        }}
      />
      <Problems problems={problems} />
      <TextField
        label="Name"
        mono
        value={entity.name}
        pattern={namePattern}
        hint="Renaming updates every reference to it."
        onCommit={(to) => {
          if (to === removed || to === entity.name) return;
          void editScene([
            { type: "rename-entity", entity: entity.id, to },
          ]).then(
            (renamed) => renamed && select(`entity:${entity.family}.${to}`),
          );
        }}
      />
      <p className="text-xs text-muted-foreground">
        {users.length
          ? `Used by ${users.map((reference) => reference.source).join(", ")}.`
          : "Nothing references it yet."}
      </p>
      <Separator />
      <YamlField
        label="Declaration"
        value={at(state?.config?.value, [entity.family, entity.name])}
        onCommit={(value) =>
          void edit("config", [
            {
              type: "set",
              path: [entity.family, entity.name],
              ...(value === removed ? {} : { value }),
            },
          ])
        }
      />
    </fieldset>
  );
}

/** Workflow options of the recipe and the environment names the configuration maps. */
export function RunInspector() {
  const { state, recipe, edit, editable, configEditable } = useRecipe();
  const problems = diagnosticsByNode(state?.diagnostics ?? []).get("run") ?? [];
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-sm font-medium">Run</h2>
      <Problems problems={problems} />
      <fieldset disabled={!editable}>
        <YamlField
          label="Workflow options"
          hint="Such as concurrency: 2 or checkpoint: { store: { $ref: stores.state }, runId: main }."
          value={record(recipe?.value).workflow}
          onCommit={(value) =>
            void edit("recipe", [
              {
                type: "set",
                path: ["workflow"],
                ...(value === removed ? {} : { value }),
              },
            ])
          }
        />
      </fieldset>
      <fieldset disabled={!configEditable}>
        <YamlField
          label="Environment"
          hint="Names the recipe may read, mapped to host variables."
          value={record(state?.config?.value).environment}
          onCommit={(value) =>
            void edit("config", [
              {
                type: "set",
                path: ["environment"],
                ...(value === removed ? {} : { value }),
              },
            ])
          }
        />
      </fieldset>
    </div>
  );
}
