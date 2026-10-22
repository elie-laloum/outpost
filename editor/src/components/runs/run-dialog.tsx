import { Play } from "lucide-react";
import { useState } from "react";
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
import { useRuns } from "@/lib/runs";
import { useEditor } from "@/lib/store";
import { record } from "../inspector/action-forms";

function placeholder(value: unknown): string | undefined {
  if (value === undefined || typeof value === "string") return value;
  return JSON.stringify(value);
}

/** Collects recipe inputs, saves the drafts when needed and starts a run. */
export function RunDialog({
  open,
  onOpenChange,
  onStarted,
}: {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly onStarted: () => void;
}) {
  const recipe = useEditor((store) => store.state?.recipe);
  const dirty = useEditor(
    (store) => !!(store.state?.recipe?.dirty || store.state?.config?.dirty),
  );
  const save = useEditor((store) => store.save);
  const start = useRuns((store) => store.start);
  const failure = useRuns((store) => store.failure);
  const [values, setValues] = useState<Record<string, string>>({});
  const [runId, setRunId] = useState("");
  const [starting, setStarting] = useState(false);
  const inputs = Object.entries(record(record(recipe?.value).inputs));
  const submit = async () => {
    setStarting(true);
    try {
      if (dirty && !(await save())) return;
      const provided = Object.fromEntries(
        Object.entries(values).filter(([, value]) => value !== ""),
      );
      const run = await start({
        action: "run",
        inputs: provided,
        ...(runId ? { runId } : {}),
      });
      if (!run) return;
      onOpenChange(false);
      onStarted();
    } finally {
      setStarting(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Run the recipe</DialogTitle>
          <DialogDescription>
            Runs outpost recipe run on the saved files in a separate process. It
            uses the sandbox and agents of the configuration, so it may change
            files and spend model usage.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          {inputs.length === 0 && (
            <p className="text-sm text-muted-foreground">
              This recipe declares no inputs.
            </p>
          )}
          {inputs.map(([name, definition]) => {
            const input = record(definition);
            const id = `run-input-${name}`;
            return (
              <div key={name} className="flex flex-col gap-1.5">
                <Label htmlFor={id}>
                  <span className="font-mono">{name}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {String(input.type ?? "string")}
                  </span>
                </Label>
                <Input
                  id={id}
                  className="font-mono text-xs"
                  placeholder={placeholder(input.default)}
                  value={values[name] ?? ""}
                  onChange={(event) =>
                    setValues({ ...values, [name]: event.target.value })
                  }
                />
                {typeof input.description === "string" && (
                  <p className="text-xs text-muted-foreground">
                    {input.description}
                  </p>
                )}
              </div>
            );
          })}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="run-id">Durable run identifier</Label>
            <Input
              id="run-id"
              className="font-mono text-xs"
              placeholder="Optional"
              value={runId}
              onChange={(event) => setRunId(event.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Only for recipes with a workflow checkpoint; leave empty to use
              the checkpoint&apos;s own identifier.
            </p>
          </div>
          {failure && <p className="text-sm text-destructive">{failure}</p>}
        </div>
        <DialogFooter>
          <Button disabled={starting} onClick={() => void submit()}>
            <Play /> {dirty ? "Save and run" : "Run"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
