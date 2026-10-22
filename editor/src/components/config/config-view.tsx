import { Blocks, Bot, FileCode2, KeyRound, Puzzle, Server } from "lucide-react";
import { type ReactNode, useState } from "react";
import { useEditor } from "@/lib/store";
import { cn } from "@/lib/utils";
import { record } from "../inspector/action-forms";
import { removed } from "../inspector/fields";
import { YamlView } from "../yaml-view";
import { ExtensionsPanel } from "./extensions-panel";
import {
  AgentsSection,
  type ConfigSetter,
  EnvironmentSection,
  OtherSections,
  WorkspaceSection,
} from "./sections";

const pages = [
  { id: "workspace", label: "Workspace and sandbox", icon: Server },
  { id: "agents", label: "Agents", icon: Bot },
  { id: "environment", label: "Environment", icon: KeyRound },
  { id: "extensions", label: "Extensions", icon: Puzzle },
  { id: "components", label: "Components", icon: Blocks },
  { id: "yaml", label: "YAML", icon: FileCode2 },
] as const;

type Page = (typeof pages)[number]["id"];

/** Forms for the common configuration sections, extensions, and the full YAML. */
export function ConfigView() {
  const config = useEditor((store) => store.state?.config);
  const editable = useEditor((store) => !!store.state?.editable.config);
  const families = useEditor((store) => store.info?.families ?? []);
  const edit = useEditor((store) => store.edit);
  const [page, setPage] = useState<Page>("workspace");
  if (!config)
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        Open a configuration file with the recipe to edit it here.
      </div>
    );
  const value = record(config.value);
  const set: ConfigSetter = (path, next) =>
    void edit("config", [
      { type: "set", path, ...(next === removed ? {} : { value: next }) },
    ]);
  const forms: Record<Exclude<Page, "yaml" | "extensions">, ReactNode> = {
    workspace: <WorkspaceSection config={value} set={set} />,
    agents: <AgentsSection config={value} set={set} />,
    environment: <EnvironmentSection config={value} set={set} />,
    components: <OtherSections config={value} set={set} families={families} />,
  };
  const structured = page !== "yaml" && page !== "extensions";
  return (
    <div className="flex min-w-0 flex-1">
      <nav
        className="flex w-56 shrink-0 flex-col gap-1 border-r p-3"
        aria-label="Configuration sections"
      >
        {pages.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-current={page === item.id ? "page" : undefined}
            onClick={() => setPage(item.id)}
            className={cn(
              "flex items-center gap-2 px-2 py-1.5 text-left text-sm hover:bg-card",
              page === item.id && "bg-secondary text-foreground",
            )}
          >
            <item.icon className="size-4 text-primary" aria-hidden />
            {item.label}
          </button>
        ))}
      </nav>
      {page === "yaml" && <YamlView role="config" />}
      {page === "extensions" && (
        <div className="flex min-w-0 flex-1 flex-col overflow-y-auto p-6">
          <ExtensionsPanel />
        </div>
      )}
      {structured && (
        <div className="flex-1 overflow-y-auto p-6">
          <fieldset
            disabled={!editable}
            className="mx-auto flex max-w-2xl flex-col gap-4"
          >
            {!editable && (
              <p className="text-sm text-warning">
                Forms require valid YAML with version: 3. Use the YAML page to
                fix the file.
              </p>
            )}
            {forms[page]}
          </fieldset>
        </div>
      )}
    </div>
  );
}
