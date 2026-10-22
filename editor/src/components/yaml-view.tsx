import { useEffect, useRef, useState } from "react";
import { useEditor } from "@/lib/store";
import type { RecipeEditorRole } from "@/lib/types";
import { CodeEditor } from "./code/code-editor";

const delayMs = 400;

/** The full YAML text of a draft; typing is sent after a short pause and validated in place. */
export function YamlView({ role }: { readonly role: RecipeEditorRole }) {
  const draft = useEditor((store) => store.state?.[role]);
  const diagnostics = useEditor((store) => store.state?.diagnostics ?? []);
  const replaceText = useEditor((store) => store.replaceText);
  const [local, setLocal] = useState<string>();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  if (!draft)
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        No {role === "recipe" ? "recipe" : "configuration"} file is open.
      </div>
    );
  const onChange = (text: string) => {
    setLocal(text);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      void replaceText(role, text).then(() =>
        setLocal((current) => (current === text ? undefined : current)),
      );
    }, delayMs);
  };
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex h-8 items-center border-b px-3 font-mono text-xs text-muted-foreground">
        {draft.path}
      </div>
      <CodeEditor
        className="flex-1"
        language="yaml"
        label={`${draft.path} YAML`}
        value={local ?? draft.text}
        onChange={onChange}
        diagnostics={diagnostics.filter(
          (diagnostic) => diagnostic.file === role,
        )}
      />
    </div>
  );
}
