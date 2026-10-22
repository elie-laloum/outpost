import { indentWithTab } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { yaml } from "@codemirror/lang-yaml";
import { type Diagnostic, lintGutter, setDiagnostics } from "@codemirror/lint";
import {
  Annotation,
  Compartment,
  EditorState,
  type Extension,
} from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { basicSetup } from "codemirror";
import { useEffect, useRef } from "react";
import { diagnosticOffset } from "@/lib/diagnostics";
import type { RecipeEditorDiagnostic } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Marks changes that come from the server so they are not echoed back. */
const external = Annotation.define<boolean>();

const languages = {
  yaml,
  typescript: () => javascript({ typescript: true }),
} as const;

const theme = EditorView.theme(
  {
    "&": { backgroundColor: "var(--card)", color: "var(--foreground)" },
    ".cm-gutters": {
      backgroundColor: "var(--card)",
      color: "var(--muted-foreground)",
      borderRight: "1px solid var(--border)",
    },
    ".cm-activeLine, .cm-activeLineGutter": {
      backgroundColor: "oklch(27.8% 0.033 256.848 / 45%)",
    },
    ".cm-content": {
      fontFamily: "var(--font-mono)",
      caretColor: "var(--primary)",
    },
    ".cm-cursor": { borderLeftColor: "var(--primary)" },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection":
      {
        backgroundColor: "oklch(75% 0.16 55 / 25%)",
      },
    ".cm-tooltip": {
      backgroundColor: "var(--popover)",
      border: "1px solid var(--border)",
    },
  },
  { dark: true },
);

interface CodeEditorProps {
  readonly value: string;
  readonly language: keyof typeof languages;
  readonly onChange?: (value: string) => void;
  readonly diagnostics?: readonly RecipeEditorDiagnostic[];
  readonly readOnly?: boolean;
  readonly className?: string;
  readonly label?: string;
}

/** CodeMirror editor that accepts outside updates without losing the cursor while focused. */
export function CodeEditor({
  value,
  language,
  onChange,
  diagnostics = [],
  readOnly = false,
  className,
  label,
}: CodeEditorProps) {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const change = useRef(onChange);
  const editable = useRef(new Compartment());
  change.current = onChange;

  useEffect(() => {
    if (!host.current) return;
    const extensions: Extension[] = [
      basicSetup,
      keymap.of([indentWithTab]),
      languages[language](),
      lintGutter(),
      theme,
      editable.current.of(EditorState.readOnly.of(readOnly)),
      EditorView.contentAttributes.of(label ? { "aria-label": label } : {}),
      EditorView.updateListener.of((update) => {
        if (!update.docChanged) return;
        if (update.transactions.every((item) => item.annotation(external)))
          return;
        change.current?.(update.state.doc.toString());
      }),
    ];
    view.current = new EditorView({
      parent: host.current,
      state: EditorState.create({ doc: value, extensions }),
    });
    return () => view.current?.destroy();
    // The editor is created once per language; value and diagnostics sync below.
  }, [language]);

  useEffect(() => {
    const current = view.current;
    if (!current || current.state.doc.toString() === value) return;
    const head = Math.min(current.state.selection.main.head, value.length);
    current.dispatch({
      changes: { from: 0, to: current.state.doc.length, insert: value },
      selection: { anchor: head },
      annotations: external.of(true),
    });
  }, [value]);

  useEffect(() => {
    view.current?.dispatch({
      effects: editable.current.reconfigure(EditorState.readOnly.of(readOnly)),
    });
  }, [readOnly]);

  useEffect(() => {
    const current = view.current;
    if (!current) return;
    const text = current.state.doc.toString();
    const marks: Diagnostic[] = diagnostics.map((diagnostic) => {
      const from = diagnosticOffset(text, diagnostic.line, diagnostic.column);
      const line = current.state.doc.lineAt(from);
      return {
        from,
        to: Math.max(from, line.to),
        severity: "error",
        message: diagnostic.hint
          ? `${diagnostic.message}\n${diagnostic.hint}`
          : diagnostic.message,
      };
    });
    current.dispatch(setDiagnostics(current.state, marks));
  }, [diagnostics, value]);

  return (
    <div
      ref={host}
      className={cn("h-full min-h-0 overflow-hidden", className)}
    />
  );
}
