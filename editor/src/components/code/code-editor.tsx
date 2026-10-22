import { indentWithTab } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { yaml } from "@codemirror/lang-yaml";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { type Diagnostic, lintGutter, setDiagnostics } from "@codemirror/lint";
import {
  Annotation,
  Compartment,
  EditorState,
  type Extension,
} from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { tags } from "@lezer/highlight";
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

const highlight = HighlightStyle.define([
  {
    tag: [tags.keyword, tags.operatorKeyword, tags.modifier],
    color: "oklch(78% 0.14 55)",
  },
  {
    tag: [tags.string, tags.special(tags.string)],
    color: "oklch(80% 0.12 150)",
  },
  {
    tag: [tags.number, tags.bool, tags.null, tags.atom],
    color: "oklch(80% 0.11 210)",
  },
  {
    tag: [tags.comment, tags.meta],
    color: "oklch(62% 0.02 260)",
    fontStyle: "italic",
  },
  {
    tag: [tags.propertyName, tags.definition(tags.propertyName)],
    color: "oklch(83% 0.08 240)",
  },
  { tag: [tags.typeName, tags.className], color: "oklch(82% 0.1 300)" },
  {
    tag: [tags.function(tags.variableName), tags.definition(tags.variableName)],
    color: "oklch(86% 0.1 90)",
  },
  {
    tag: [tags.punctuation, tags.separator, tags.bracket],
    color: "oklch(70.7% 0.022 261.325)",
  },
  { tag: tags.invalid, color: "var(--destructive)" },
]);

interface CodeEditorProps {
  readonly value: string;
  readonly language: keyof typeof languages;
  readonly onChange?: (value: string) => void;
  readonly diagnostics?: readonly RecipeEditorDiagnostic[];
  readonly readOnly?: boolean;
  readonly className?: string;
  readonly label?: string;
  /** Called on Mod-S inside the editor instead of the page-wide save. */
  readonly onSave?: () => void;
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
  onSave,
}: CodeEditorProps) {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const change = useRef(onChange);
  const save = useRef(onSave);
  save.current = onSave;
  const editable = useRef(new Compartment());
  change.current = onChange;

  useEffect(() => {
    if (!host.current) return;
    const extensions: Extension[] = [
      basicSetup,
      keymap.of([
        indentWithTab,
        {
          key: "Mod-s",
          run: () => {
            if (!save.current) return false;
            save.current();
            return true;
          },
        },
      ]),
      languages[language](),
      lintGutter(),
      theme,
      syntaxHighlighting(highlight),
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
