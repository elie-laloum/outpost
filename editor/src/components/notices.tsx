import { RefreshCw, TriangleAlert, X } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEditor } from "@/lib/store";
import { cn } from "@/lib/utils";

function Notice({
  tone,
  children,
  actions,
}: {
  tone: "warning" | "error" | "info";
  children: ReactNode;
  actions?: ReactNode;
}) {
  const tones = {
    warning: "border-warning/40 bg-warning/10",
    error: "border-destructive/40 bg-destructive/10",
    info: "border-border bg-card",
  };
  return (
    <div
      role={tone === "info" ? "status" : "alert"}
      className={cn(
        "flex items-center gap-3 border-b px-4 py-2 text-sm",
        tones[tone],
      )}
    >
      <TriangleAlert
        className={cn(
          "size-4 shrink-0",
          tone === "error" ? "text-destructive" : "text-warning",
        )}
        aria-hidden
      />
      <div className="flex-1">{children}</div>
      {actions}
    </div>
  );
}

/** Request failures, files changed on disk and read-only drafts. */
export function Notices() {
  const state = useEditor((store) => store.state);
  const failure = useEditor((store) => store.failure);
  const dismiss = useEditor((store) => store.dismiss);
  const reload = useEditor((store) => store.reload);
  const changed = [state?.recipe, state?.config].flatMap((draft) =>
    draft?.changedOnDisk ? [draft.path] : [],
  );
  return (
    <>
      {failure && (
        <Notice
          tone="error"
          actions={
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Dismiss"
              onClick={dismiss}
            >
              <X />
            </Button>
          }
        >
          {failure.message}
          {failure.diagnostic?.hint && (
            <span className="ml-2 text-muted-foreground">
              {failure.diagnostic.hint}
            </span>
          )}
        </Notice>
      )}
      {changed.length > 0 && (
        <Notice
          tone="warning"
          actions={
            <Button variant="outline" size="sm" onClick={() => void reload()}>
              <RefreshCw /> Reload from disk
            </Button>
          }
        >
          {changed.join(" and ")} changed on disk while you were editing. Reload
          to discard your edits, or save to replace the file.
        </Notice>
      )}
      {state?.recipe && !state.editable.recipe && (
        <Notice tone="info">
          Visual editing requires valid YAML in recipe format 3. The canvas is
          read-only; the recipe YAML view stays editable.
        </Notice>
      )}
    </>
  );
}

/** Asks before a save replaces files that changed on disk. */
export function ConflictDialog() {
  const conflict = useEditor((store) => store.conflict);
  const dismiss = useEditor((store) => store.dismiss);
  const save = useEditor((store) => store.save);
  const reload = useEditor((store) => store.reload);
  return (
    <Dialog open={!!conflict} onOpenChange={(open) => !open && dismiss()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Files changed on disk</DialogTitle>
          <DialogDescription>
            Another program modified {conflict?.join(", ")} since the editor
            read it. Saving now replaces those changes.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={dismiss}>
            Keep editing
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              dismiss();
              void reload();
            }}
          >
            Reload from disk
          </Button>
          <Button variant="destructive" onClick={() => void save(true)}>
            Replace files
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
