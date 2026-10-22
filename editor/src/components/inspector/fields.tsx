import { type ReactNode, useEffect, useId, useState } from "react";
import { parse, stringify } from "yaml";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

/** Emitted when a field is cleared, so the property is removed from the YAML. */
export const removed = Symbol("removed");
export type FieldValue<T> = T | typeof removed;

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: (id: string) => ReactNode;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children(id)}
      {error && <p className="text-xs text-destructive">{error}</p>}
      {!error && hint && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

/** Text kept locally while typing and committed on blur or Enter. */
export function TextField({
  label,
  value,
  onCommit,
  multiline = false,
  hint,
  placeholder,
  mono = false,
  pattern,
}: {
  readonly label: string;
  readonly value: string | undefined;
  readonly onCommit: (value: FieldValue<string>) => void;
  readonly multiline?: boolean;
  readonly hint?: string;
  readonly placeholder?: string;
  readonly mono?: boolean;
  readonly pattern?: { readonly test: RegExp; readonly message: string };
}) {
  const [draft, setDraft] = useState(value ?? "");
  useEffect(() => setDraft(value ?? ""), [value]);
  const invalid =
    draft !== "" && pattern && !pattern.test.test(draft)
      ? pattern.message
      : undefined;
  const commit = () => {
    if (invalid || draft === (value ?? "")) return;
    onCommit(draft === "" ? removed : draft);
  };
  const shared = {
    value: draft,
    placeholder,
    "aria-invalid": !!invalid,
    className: mono ? "font-mono text-xs" : undefined,
    onBlur: commit,
  };
  return (
    <Field label={label} hint={hint} error={invalid}>
      {(id) =>
        multiline ? (
          <Textarea
            id={id}
            {...shared}
            onChange={(event) => setDraft(event.target.value)}
          />
        ) : (
          <Input
            id={id}
            {...shared}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && commit()}
          />
        )
      }
    </Field>
  );
}

export function NumberField({
  label,
  value,
  onCommit,
  hint,
  minimum = 0,
}: {
  readonly label: string;
  readonly value: unknown;
  readonly onCommit: (value: FieldValue<number>) => void;
  readonly hint?: string;
  readonly minimum?: number;
}) {
  return (
    <TextField
      label={label}
      hint={hint}
      value={typeof value === "number" ? String(value) : undefined}
      pattern={{
        test: /^\d+$/,
        message: `Enter a whole number of at least ${minimum}`,
      }}
      onCommit={(text) => {
        if (text === removed) return onCommit(removed);
        if (Number(text) >= minimum) onCommit(Number(text));
      }}
    />
  );
}

/** One string per line, such as command arguments or gate actors. */
export function ListField({
  label,
  value,
  onCommit,
  hint,
}: {
  readonly label: string;
  readonly value: unknown;
  readonly onCommit: (value: FieldValue<string[]>) => void;
  readonly hint?: string;
}) {
  const items = Array.isArray(value) ? value.map(String) : [];
  return (
    <TextField
      label={label}
      hint={hint ?? "One item per line."}
      multiline
      mono
      value={items.join("\n")}
      onCommit={(text) =>
        onCommit(
          text === removed
            ? removed
            : text.split("\n").filter((line) => line.trim()),
        )
      }
    />
  );
}

/** A YAML fragment for values the forms do not cover; parsing errors stay local. */
export function YamlField({
  label,
  value,
  onCommit,
  hint,
}: {
  readonly label: string;
  readonly value: unknown;
  readonly onCommit: (value: FieldValue<unknown>) => void;
  readonly hint?: string;
}) {
  const text =
    value === undefined ? "" : stringify(value, { lineWidth: 0 }).trimEnd();
  const [draft, setDraft] = useState(text);
  const [error, setError] = useState<string>();
  useEffect(() => {
    setDraft(text);
    setError(undefined);
  }, [text]);
  const commit = () => {
    if (draft === text) return;
    if (!draft.trim()) return onCommit(removed);
    try {
      const parsed: unknown = parse(draft);
      setError(undefined);
      onCommit(parsed);
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message.split("\n")[0]
          : "Invalid YAML",
      );
    }
  };
  return (
    <Field label={label} hint={hint} error={error}>
      {(id) => (
        <Textarea
          id={id}
          value={draft}
          spellCheck={false}
          aria-invalid={!!error}
          className="min-h-20 font-mono text-xs"
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
        />
      )}
    </Field>
  );
}

export function ChoiceField({
  label,
  value,
  choices,
  onCommit,
  hint,
  placeholder = "Choose…",
}: {
  readonly label: string;
  readonly value: string | undefined;
  readonly choices: readonly string[];
  readonly onCommit: (value: string) => void;
  readonly hint?: string;
  readonly placeholder?: string;
}) {
  const options =
    value && !choices.includes(value) ? [value, ...choices] : choices;
  return (
    <Field label={label} hint={hint}>
      {(id) => (
        <Select value={value ?? ""} onValueChange={onCommit}>
          <SelectTrigger id={id}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((choice) => (
              <SelectItem key={choice} value={choice}>
                {choice}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </Field>
  );
}
