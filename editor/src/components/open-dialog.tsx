import { CornerLeftUp, FileText, Folder } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { useEditor } from "@/lib/store";
import type { EditorDirectoryEntry } from "@/lib/types";
import { cn } from "@/lib/utils";

const yamlFile = /\.ya?ml$/i;
const parent = (path: string) => path.split("/").slice(0, -1).join("/");

function Browser({
  onPick,
}: {
  readonly onPick: (
    entry: EditorDirectoryEntry,
    siblings: readonly EditorDirectoryEntry[],
  ) => void;
}) {
  const [directory, setDirectory] = useState("");
  const [entries, setEntries] = useState<readonly EditorDirectoryEntry[]>([]);
  const [error, setError] = useState<string>();
  useEffect(() => {
    api<EditorDirectoryEntry[]>(
      `/api/files?path=${encodeURIComponent(directory)}`,
    )
      .then((items) => {
        setEntries(items);
        setError(undefined);
      })
      .catch((failure: unknown) =>
        setError(failure instanceof Error ? failure.message : String(failure)),
      );
  }, [directory]);
  const visible = entries.filter(
    (entry) => entry.kind === "directory" || yamlFile.test(entry.name),
  );
  return (
    <div className="flex flex-col border">
      <div className="flex h-8 items-center gap-2 border-b px-2 font-mono text-xs text-muted-foreground">
        <button
          type="button"
          aria-label="Parent directory"
          disabled={!directory}
          onClick={() => setDirectory(parent(directory))}
          className="disabled:opacity-30"
        >
          <CornerLeftUp className="size-3.5" />
        </button>
        <span className="truncate">./{directory}</span>
      </div>
      <ul className="h-56 overflow-y-auto py-1" aria-label="Files">
        {error && (
          <li className="px-3 py-2 text-xs text-destructive">{error}</li>
        )}
        {!error && visible.length === 0 && (
          <li className="px-3 py-2 text-xs text-muted-foreground">
            No YAML file here.
          </li>
        )}
        {visible.map((entry) => {
          const Icon = entry.kind === "directory" ? Folder : FileText;
          return (
            <li key={entry.path}>
              <button
                type="button"
                className="flex w-full items-center gap-2 px-3 py-1 text-left text-sm hover:bg-secondary"
                onClick={() =>
                  entry.kind === "directory"
                    ? setDirectory(entry.path)
                    : onPick(entry, entries)
                }
              >
                <Icon
                  className={cn(
                    "size-3.5",
                    entry.kind === "directory"
                      ? "text-primary"
                      : "text-muted-foreground",
                  )}
                  aria-hidden
                />
                {entry.name}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function PathField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={`path-${label}`}>{label}</Label>
      <Input
        id={`path-${label}`}
        className="font-mono text-xs"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

/** Chooses the recipe and configuration files, or starts new drafts from a starter. */
export function OpenDialog({
  open,
  onOpenChange,
}: {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}) {
  const info = useEditor((store) => store.info);
  const failure = useEditor((store) => store.failure);
  const openProject = useEditor((store) => store.open);
  const hasProject = useEditor((store) => !!store.state?.recipe);
  const [recipe, setRecipe] = useState("");
  const [config, setConfig] = useState("");
  const [starter, setStarter] = useState("ephemeral");
  const [mode, setMode] = useState("open");
  useEffect(() => {
    if (!info || !open) return;
    setRecipe(info.files.recipe ?? info.suggested.recipe ?? "recipe.yaml");
    setConfig(info.files.config ?? info.suggested.config ?? "outpost.yaml");
  }, [info, open]);
  const submit = async () => {
    const opened = await openProject({
      recipe,
      ...(config.trim() ? { config } : {}),
      ...(mode === "new" ? { starter } : {}),
    });
    if (opened) onOpenChange(false);
  };
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => (hasProject || next) && onOpenChange(next)}
    >
      <DialogContent className="sm:max-w-2xl" showCloseButton={hasProject}>
        <DialogHeader>
          <DialogTitle>Open a recipe</DialogTitle>
          <DialogDescription>
            Files stay inside {info?.directory ?? "the editor directory"}.
            Nothing is written until you save.
          </DialogDescription>
        </DialogHeader>
        <Tabs value={mode} onValueChange={setMode}>
          <TabsList>
            <TabsTrigger value="open">Existing files</TabsTrigger>
            <TabsTrigger value="new">New from a starter</TabsTrigger>
          </TabsList>
          <TabsContent value="open" className="flex flex-col gap-3">
            <Browser
              onPick={(entry, siblings) => {
                setRecipe(entry.path);
                const local = siblings.find(
                  (item) =>
                    /^outpost\.ya?ml$/i.test(item.name) &&
                    item.path !== entry.path,
                );
                if (local) setConfig(local.path);
              }}
            />
          </TabsContent>
          <TabsContent value="new" className="grid gap-2 sm:grid-cols-3">
            {info?.starters.map((item) => (
              <button
                key={item.name}
                type="button"
                aria-pressed={starter === item.name}
                onClick={() => setStarter(item.name)}
                className={cn(
                  "flex flex-col gap-1 border p-3 text-left text-sm",
                  starter === item.name
                    ? "border-primary bg-primary/5"
                    : "hover:border-input",
                )}
              >
                <span className="font-medium capitalize">{item.name}</span>
                <span className="text-xs text-muted-foreground">
                  {item.description}
                </span>
              </button>
            ))}
          </TabsContent>
        </Tabs>
        <div className="grid gap-3 sm:grid-cols-2">
          <PathField label="Recipe" value={recipe} onChange={setRecipe} />
          <PathField
            label="Configuration"
            value={config}
            onChange={setConfig}
            hint={
              mode === "new"
                ? "Leave empty to create only the recipe."
                : "Optional; leave empty to open the recipe alone."
            }
          />
        </div>
        {mode === "new" && (
          <p className="text-xs text-muted-foreground">
            Existing files are opened as they are; missing ones start from the{" "}
            {starter} starter.
          </p>
        )}
        {failure && open && (
          <p className="text-sm text-destructive">{failure.message}</p>
        )}
        <DialogFooter>
          <Button disabled={!recipe.trim()} onClick={() => void submit()}>
            {mode === "new" ? "Create drafts" : "Open"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
