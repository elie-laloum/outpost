import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { record } from "../inspector/action-forms";
import {
  ChoiceField,
  type FieldValue,
  ListField,
  TextField,
  YamlField,
  removed,
} from "../inspector/fields";

export type ConfigSetter = (
  path: readonly (string | number)[],
  value: FieldValue<unknown>,
) => void;

interface SectionProps {
  readonly config: Readonly<Record<string, unknown>>;
  readonly set: ConfigSetter;
}

const text = (value: unknown) =>
  typeof value === "string" ? value : undefined;

const workspaces: Readonly<Record<string, Readonly<Record<string, unknown>>>> =
  {
    ephemeral: { kind: "ephemeral" },
    directory: { kind: "directory", directory: ".", access: "copy" },
    git: { kind: "git", repository: ".", branch: { mode: "current" } },
  };

const providers: Readonly<Record<string, Readonly<Record<string, unknown>>>> = {
  local: { provider: "local" },
  docker: { provider: "docker", image: "outpost-codex:dev" },
  podman: { provider: "podman", image: "outpost-codex:dev" },
  daytona: { provider: "daytona" },
  vercel: { provider: "vercel" },
  firecracker: { provider: "firecracker" },
};

const harnesses = [
  "codex",
  "claude",
  "copilot",
  "kimi",
  "agy",
  "outpost",
] as const;

function WorkspaceFields({ config, set }: SectionProps) {
  const workspace = record(config.workspace);
  const kind = text(workspace.kind);
  const branch = record(workspace.branch);
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-sm font-medium">Workspace</h2>
      <ChoiceField
        label="Kind"
        hint="Changing the kind replaces the workspace settings; undo restores them."
        value={kind}
        choices={Object.keys(workspaces)}
        onCommit={(value) =>
          value !== kind && set(["workspace"], workspaces[value])
        }
      />
      {kind === "directory" && (
        <>
          <TextField
            label="Directory"
            mono
            value={text(workspace.directory)}
            onCommit={(value) => set(["workspace", "directory"], value)}
          />
          <ListField
            label="Paths"
            hint="Glob patterns to include, one per line; empty includes everything."
            value={workspace.paths}
            onCommit={(value) => set(["workspace", "paths"], value)}
          />
        </>
      )}
      {kind === "git" && (
        <>
          <TextField
            label="Repository"
            mono
            value={text(workspace.repository)}
            onCommit={(value) => set(["workspace", "repository"], value)}
          />
          <ChoiceField
            label="Branch"
            value={text(branch.mode)}
            choices={["current", "named", "integrate"]}
            onCommit={(value) => set(["workspace", "branch", "mode"], value)}
          />
          {branch.mode !== "current" && (
            <div className="grid grid-cols-2 gap-3">
              <TextField
                label="Branch name"
                mono
                value={text(branch.name)}
                onCommit={(value) =>
                  set(["workspace", "branch", "name"], value)
                }
              />
              <TextField
                label="Start from"
                mono
                value={text(branch.from)}
                onCommit={(value) =>
                  set(["workspace", "branch", "from"], value)
                }
              />
            </div>
          )}
        </>
      )}
    </section>
  );
}

function SandboxFields({ config, set }: SectionProps) {
  const sandbox = record(config.sandbox);
  const provider = text(sandbox.provider);
  const reference = text(sandbox.$ref);
  if (reference)
    return (
      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium">Sandbox</h2>
        <TextField
          label="Sandbox provider entry"
          mono
          value={reference}
          onCommit={(value) => set(["sandbox", "$ref"], value)}
        />
      </section>
    );
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-sm font-medium">Sandbox</h2>
      <ChoiceField
        label="Provider"
        hint="Changing the provider replaces the sandbox settings."
        value={provider}
        choices={Object.keys(providers)}
        onCommit={(value) =>
          value !== provider && set(["sandbox"], providers[value])
        }
      />
      {(provider === "docker" || provider === "podman") && (
        <TextField
          label="Image"
          mono
          hint="Build one with outpost image build, such as outpost-codex:dev."
          value={text(sandbox.image)}
          onCommit={(value) => set(["sandbox", "image"], value)}
        />
      )}
      <YamlField
        label="Variables"
        hint="Values passed into the sandbox, such as LOG_LEVEL: debug or TOKEN: { env: TOKEN }."
        value={sandbox.variables}
        onCommit={(value) => set(["sandbox", "variables"], value)}
      />
    </section>
  );
}

export function WorkspaceSection(props: SectionProps) {
  return (
    <div className="flex flex-col gap-8">
      <WorkspaceFields {...props} />
      <SandboxFields {...props} />
    </div>
  );
}

function AgentCard({
  name,
  agent,
  set,
}: {
  name: string;
  agent: Readonly<Record<string, unknown>>;
  set: ConfigSetter;
}) {
  const authentication = agent.authentication;
  const simple =
    authentication === undefined || typeof authentication === "string";
  return (
    <div className="flex flex-col gap-3 border p-4">
      <div className="flex items-center gap-2">
        <span className="flex-1 font-mono text-sm">{name}</span>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Remove agent ${name}`}
          onClick={() => set(["agents", name], removed)}
        >
          <Trash2 />
        </Button>
      </div>
      {typeof agent.$ref === "string" ? (
        <TextField
          label="Profile entry"
          mono
          value={agent.$ref}
          onCommit={(value) => set(["agents", name, "$ref"], value)}
        />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <ChoiceField
            label="Harness"
            value={text(agent.harness)}
            choices={harnesses}
            onCommit={(value) => set(["agents", name, "harness"], value)}
          />
          <TextField
            label="Model"
            mono
            value={text(agent.model)}
            placeholder="Harness default"
            onCommit={(value) => set(["agents", name, "model"], value)}
          />
          {simple && (
            <ChoiceField
              label="Authentication"
              hint="account signs in with the CLI account; usage reads an API key."
              value={text(authentication)}
              choices={["account", "usage"]}
              onCommit={(value) =>
                set(["agents", name, "authentication"], value)
              }
            />
          )}
        </div>
      )}
      {!simple && (
        <YamlField
          label="Authentication"
          value={authentication}
          onCommit={(value) => set(["agents", name, "authentication"], value)}
        />
      )}
    </div>
  );
}

function AddEntry({
  label,
  onAdd,
  placeholder,
}: {
  label: string;
  onAdd: (name: string) => void;
  placeholder: string;
}) {
  const [name, setName] = useState("");
  const valid = /^[A-Za-z_][A-Za-z0-9_-]*$/.test(name);
  return (
    <form
      className="flex items-end gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        if (!valid) return;
        onAdd(name);
        setName("");
      }}
    >
      <div className="flex flex-1 flex-col gap-1.5">
        <Label htmlFor={`add-${label}`}>{label}</Label>
        <Input
          id={`add-${label}`}
          className="font-mono text-xs"
          placeholder={placeholder}
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>
      <Button type="submit" variant="outline" disabled={!valid}>
        <Plus /> Add
      </Button>
    </form>
  );
}

export function AgentsSection({ config, set }: SectionProps) {
  const agents = Object.entries(record(config.agents));
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-sm font-medium">Agents</h2>
      <p className="text-xs text-muted-foreground">
        Recipe tasks select these roles with agent: name.
      </p>
      {agents.map(([name, agent]) => (
        <AgentCard key={name} name={name} agent={record(agent)} set={set} />
      ))}
      <AddEntry
        label="New agent role"
        placeholder="coder"
        onAdd={(name) =>
          set(["agents", name], { harness: "codex", authentication: "account" })
        }
      />
    </section>
  );
}

export function EnvironmentSection({ config, set }: SectionProps) {
  const environment = Object.entries(record(config.environment));
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-sm font-medium">Environment</h2>
      <p className="text-xs text-muted-foreground">
        Names the recipe may read, mapped to host variables. Values are read
        when the recipe runs, never stored here.
      </p>
      {environment.map(([name, variable]) => (
        <div key={name} className="flex items-end gap-2">
          <div className="w-48 pb-2 font-mono text-xs">{name}</div>
          <div className="flex-1">
            <TextField
              label="Host variable"
              mono
              value={text(variable)}
              onCommit={(value) =>
                set(["environment", name], value === removed ? name : value)
              }
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Remove ${name}`}
            onClick={() => set(["environment", name], removed)}
          >
            <Trash2 />
          </Button>
        </div>
      ))}
      <AddEntry
        label="New variable"
        placeholder="GITHUB_TOKEN"
        onAdd={(name) => set(["environment", name], name)}
      />
    </section>
  );
}

const structured = new Set([
  "version",
  "$schema",
  "workspace",
  "sandbox",
  "agents",
  "environment",
  "extensions",
  "functions",
]);

export function OtherSections({
  config,
  set,
  families,
}: SectionProps & { readonly families: readonly string[] }) {
  const present = Object.keys(config).filter((key) => !structured.has(key));
  const available = families.filter(
    (family) => !structured.has(family) && !present.includes(family),
  );
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-sm font-medium">Components</h2>
      <p className="text-xs text-muted-foreground">
        Other configuration sections are edited as YAML; the schema validates
        them as you type in the YAML view.
      </p>
      {present.map((key) => (
        <div key={key} className="flex flex-col gap-2">
          <YamlField
            label={key}
            value={config[key]}
            onCommit={(value) => set([key], value)}
          />
        </div>
      ))}
      {available.length > 0 && (
        <Select value="" onValueChange={(family) => set([family], {})}>
          <SelectTrigger aria-label="Add a section">
            <SelectValue placeholder="Add a section…" />
          </SelectTrigger>
          <SelectContent>
            {available.map((family) => (
              <SelectItem key={family} value={family}>
                {family}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </section>
  );
}
