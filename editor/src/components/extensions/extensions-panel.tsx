import {
  CircleCheck,
  FileCode2,
  Plus,
  Save,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiError, api } from "@/lib/api";
import { useEditor } from "@/lib/store";
import type {
  EditorFile,
  RecipeEditorContract,
  RecipeEditorExtension,
  RecipeEditorExtensionCreation,
  RecipeEditorVerification,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { CodeEditor } from "../code/code-editor";

interface ExtensionList {
  readonly extensions: readonly RecipeEditorExtension[];
  readonly kinds: readonly string[];
  readonly contracts: readonly RecipeEditorContract[];
}

const identifier = (name: string) =>
  name
    .replace(/[-_]+([a-z0-9])/gi, (_, letter: string) => letter.toUpperCase())
    .replace(/^[^A-Za-z_$]+/, "");

function CreateDialog({
  open,
  onOpenChange,
  contracts,
  kinds,
  onCreated,
}: {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly contracts: readonly RecipeEditorContract[];
  readonly kinds: readonly string[];
  readonly onCreated: (path: string) => void;
}) {
  const receive = useEditor((store) => store.receive);
  const revision = useEditor((store) => store.state?.revision ?? 0);
  const [name, setName] = useState("summary");
  const [kind, setKind] = useState("callback");
  const [contract, setContract] = useState("call.options.perform");
  const [module, setModule] = useState("./steps.ts");
  const [alias, setAlias] = useState(true);
  const [error, setError] = useState<string>();
  const choices = contracts.filter((item) => item.kind === kind);
  const exportName = identifier(name);
  const submit = async () => {
    try {
      const created = await api<RecipeEditorExtensionCreation>(
        "/api/extensions",
        {
          name,
          kind,
          ...(contract && choices.length ? { contract } : {}),
          module,
          export: exportName,
          ...(alias && kind === "callback" ? { function: name } : {}),
          revision,
        },
      );
      receive(created.state);
      setError(undefined);
      onOpenChange(false);
      onCreated(created.path);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : String(failure));
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New extension</DialogTitle>
          <DialogDescription>
            Declares the extension in the configuration draft and creates its
            module if the file does not exist yet.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="extension-name">Name</Label>
              <Input
                id="extension-name"
                className="font-mono text-xs"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="extension-kind">Kind</Label>
              <Select
                value={kind}
                onValueChange={(next) => {
                  setKind(next);
                  setContract(
                    contracts.find((item) => item.kind === next)?.contract ??
                      "",
                  );
                }}
              >
                <SelectTrigger id="extension-kind">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {kinds.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {choices.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="extension-contract">Contract</Label>
              <Input
                id="extension-contract"
                list="extension-contracts"
                className="font-mono text-xs"
                value={contract}
                onChange={(event) => setContract(event.target.value)}
              />
              <datalist id="extension-contracts">
                {choices.map((item) => (
                  <option key={item.contract} value={item.contract} />
                ))}
              </datalist>
              <p className="text-xs text-muted-foreground">
                The component option the extension implements, such as
                call.options.perform for call tasks.
              </p>
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="extension-module">Module</Label>
            <Input
              id="extension-module"
              className="font-mono text-xs"
              value={module}
              onChange={(event) => setModule(event.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Relative to the configuration file. The export is named{" "}
              <code className="font-mono">{exportName || "…"}</code>.
            </p>
          </div>
          {kind === "callback" && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={alias}
                onChange={(event) => setAlias(event.target.checked)}
              />
              Also declare{" "}
              <code className="font-mono text-xs">functions.{name}</code> for
              call and loop tasks
            </label>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button
            disabled={!name || !exportName || !module}
            onClick={() => void submit()}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ModuleEditor({ path }: { readonly path: string }) {
  const [file, setFile] = useState<EditorFile>();
  const [text, setText] = useState<string>();
  const [message, setMessage] = useState<{
    tone: "error" | "success";
    text: string;
  }>();
  const load = useCallback(() => {
    api<EditorFile>(`/api/modules?path=${encodeURIComponent(path)}`)
      .then((loaded) => {
        setFile(loaded);
        setText(undefined);
        setMessage(undefined);
      })
      .catch((failure: unknown) =>
        setMessage({
          tone: "error",
          text: failure instanceof Error ? failure.message : String(failure),
        }),
      );
  }, [path]);
  useEffect(load, [load]);
  const save = async () => {
    if (!file || text === undefined) return;
    try {
      setFile(
        await api<EditorFile>("/api/modules", { path, text, hash: file.hash }),
      );
      setText(undefined);
      setMessage({ tone: "success", text: "Module saved." });
    } catch (failure) {
      const conflict =
        failure instanceof ApiError && failure.failure.status === 409;
      const detail =
        failure instanceof Error ? failure.message : String(failure);
      setMessage({
        tone: "error",
        text: conflict
          ? `${path} changed on disk. Reload it to see the changes, then edit again.`
          : detail,
      });
    }
  };
  if (!file)
    return message ? (
      <p className="p-4 text-sm text-destructive">{message.text}</p>
    ) : null;
  return (
    <div className="flex min-h-0 flex-1 flex-col border">
      <div className="flex h-9 items-center gap-2 border-b px-3">
        <FileCode2 className="size-3.5 text-muted-foreground" />
        <span className="flex-1 truncate font-mono text-xs">{path}</span>
        {message && (
          <span
            className={cn(
              "text-xs",
              message.tone === "error" ? "text-destructive" : "text-success",
            )}
          >
            {message.text}
          </span>
        )}
        <Button variant="ghost" size="sm" onClick={load}>
          Reload
        </Button>
        <Button
          size="sm"
          disabled={text === undefined}
          onClick={() => void save()}
        >
          <Save /> Save module
        </Button>
      </div>
      <CodeEditor
        className="min-h-80 flex-1"
        language="typescript"
        label={`${path} source`}
        value={text ?? file.text}
        onChange={setText}
        onSave={() => void save()}
      />
    </div>
  );
}

/** Declared extensions, their module sources and an import check run in a separate process. */
export function ExtensionsPanel() {
  const revision = useEditor((store) => store.state?.revision);
  const dirty = useEditor(
    (store) => !!(store.state?.recipe?.dirty || store.state?.config?.dirty),
  );
  const saveDrafts = useEditor((store) => store.save);
  const [list, setList] = useState<ExtensionList>();
  const [selected, setSelected] = useState<string>();
  const [creating, setCreating] = useState(false);
  const [verification, setVerification] = useState<
    RecipeEditorVerification & { running?: boolean }
  >();
  useEffect(() => {
    api<ExtensionList>("/api/extensions").then(setList, () => undefined);
  }, [revision]);
  const verify = async () => {
    setVerification({ ok: false, extensions: [], running: true });
    if (dirty && !(await saveDrafts())) return setVerification(undefined);
    try {
      setVerification(
        await api<RecipeEditorVerification>("/api/extensions/verify", {}),
      );
    } catch (failure) {
      setVerification({
        ok: false,
        extensions: [],
        message: failure instanceof Error ? failure.message : String(failure),
      });
    }
  };
  const extensions = list?.extensions ?? [];
  return (
    <section className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex items-center gap-2">
        <h2 className="flex-1 text-sm font-medium">Extensions</h2>
        <Button
          variant="outline"
          size="sm"
          disabled={verification?.running}
          onClick={() => void verify()}
        >
          <ShieldCheck /> {dirty ? "Save and verify" : "Verify"}
        </Button>
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus /> New extension
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Validation never imports extensions. Verify runs outpost recipe validate
        --extensions on the saved files, which executes their module code.
      </p>
      {verification && !verification.running && (
        <div
          role="status"
          className={cn(
            "flex gap-2 border p-3 text-sm",
            verification.ok
              ? "border-success/40"
              : "border-destructive/40 bg-destructive/10",
          )}
        >
          {verification.ok ? (
            <CircleCheck className="size-4 text-success" />
          ) : (
            <TriangleAlert className="size-4 text-destructive" />
          )}
          {verification.ok
            ? `Loaded ${verification.extensions.length} extension(s): ${verification.extensions.join(", ") || "none declared"}.`
            : verification.message}
        </div>
      )}
      <ul className="flex flex-col border" aria-label="Declared extensions">
        {extensions.length === 0 && (
          <li className="p-3 text-sm text-muted-foreground">
            No extension is declared.
          </li>
        )}
        {extensions.map((extension) => (
          <li key={extension.name}>
            <button
              type="button"
              disabled={!extension.path || !extension.exists}
              onClick={() => setSelected(extension.path)}
              className={cn(
                "flex w-full items-center gap-3 border-b px-3 py-2 text-left text-sm last:border-b-0 hover:bg-secondary disabled:cursor-default",
                selected === extension.path && "bg-secondary",
              )}
            >
              <span className="w-32 truncate font-mono text-xs">
                {extension.name}
              </span>
              <Badge variant="secondary">{extension.kind}</Badge>
              <span className="flex-1 truncate font-mono text-xs text-muted-foreground">
                {extension.contract}
              </span>
              {extension.functions.map((alias) => (
                <Badge key={alias} variant="outline" className="font-mono">
                  functions.{alias}
                </Badge>
              ))}
              <span
                className={cn(
                  "font-mono text-xs",
                  extension.exists
                    ? "text-muted-foreground"
                    : "text-destructive",
                )}
              >
                {extension.module}
                {!extension.exists && extension.path && " (missing)"}
              </span>
            </button>
          </li>
        ))}
      </ul>
      {selected && <ModuleEditor key={selected} path={selected} />}
      <CreateDialog
        open={creating}
        onOpenChange={setCreating}
        contracts={list?.contracts ?? []}
        kinds={list?.kinds ?? ["callback"]}
        onCreated={setSelected}
      />
    </section>
  );
}
