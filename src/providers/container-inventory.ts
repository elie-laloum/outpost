import { invariant, OutpostError } from "../domain/errors.ts";
import { executeProcess, requireSuccess } from "../infrastructure/process.ts";
import type { Executor } from "../infrastructure/process.types.ts";
import { containerEgress } from "./container-egress.constants.ts";
import type {
  ContainerInventoryOptions,
  ContainerSandbox,
  ContainerSandboxQuery,
} from "./container-inventory.types.ts";
import { validateContainerLabels } from "./container-labels.ts";
import { recoverContainer } from "./container-recovery.ts";
import { containerDefaults } from "./container.constants.ts";
import type { ContainerEngine, ContainerLabels } from "./container.types.ts";

const sandboxName = (name: string): string =>
  name.endsWith(containerDefaults.companionSuffix)
    ? name.slice(0, -containerDefaults.companionSuffix.length)
    : name;

const owned = (name: string): boolean =>
  containerDefaults.namePattern.test(sandboxName(name));

const parsed = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
};

function labelMap(value: unknown): ContainerLabels | undefined {
  // Docker reports a container without labels as null.
  if (value === null) return Object.freeze({});
  if (typeof value !== "object" || Array.isArray(value)) return undefined;
  const entries: [string, unknown][] = Object.entries(value);
  const labels = entries.flatMap(([key, label]) =>
    typeof label === "string" ? [[key, label] as const] : [],
  );
  if (labels.length !== entries.length) return undefined;
  return Object.freeze(Object.fromEntries(labels));
}

function inspected(engine: ContainerEngine, line: string): ContainerSandbox {
  const separator = line.indexOf(" ");
  const name = separator < 0 ? undefined : parsed(line.slice(0, separator));
  const labels = labelMap(parsed(line.slice(separator + 1)));
  if (typeof name !== "string" || !labels)
    throw new OutpostError(
      "provider",
      "Unexpected container inventory output",
      { engine },
    );
  // Docker reports names with a leading slash; Podman does not.
  return { name: name.replace(/^\//, ""), labels };
}

function sandboxes(
  engine: ContainerEngine,
  output: string,
): ContainerSandbox[] {
  const found = new Map<string, ContainerLabels>();
  for (const line of output.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const { name, labels } = inspected(engine, line.trim());
    const sandbox = sandboxName(name);
    const companion = sandbox !== name;
    if (!owned(name)) continue;
    if (companion && labels[containerEgress.label] !== sandbox) continue;
    if (companion && found.has(sandbox)) continue;
    found.set(sandbox, labels);
  }
  return [...found]
    .sort(([left], [right]) => (left < right ? -1 : 1))
    .map(([name, labels]) => ({ name, labels }));
}

export async function listContainerSandboxes(
  engine: ContainerEngine,
  query: ContainerSandboxQuery,
  executor: Executor = executeProcess,
): Promise<ContainerSandbox[]> {
  const labels = validateContainerLabels(query.labels);
  invariant(
    Object.keys(labels).length > 0,
    "Listing container sandboxes requires at least one label",
  );
  const call = (args: readonly string[]) =>
    requireSuccess(
      {
        executable: engine,
        arguments: args,
        deadlineMs: query.deadlineMs ?? containerDefaults.cleanupMs,
        ...(query.signal ? { signal: query.signal } : {}),
      },
      executor,
    );
  const list = async () =>
    (
      await call([
        "container",
        "ls",
        "--all",
        "--filter",
        "name=^outpost-",
        ...Object.entries(labels).flatMap(([key, value]) => [
          "--filter",
          `label=${key}=${value}`,
        ]),
        "--format",
        "{{.Names}}",
      ])
    ).stdout
      .split(/\r?\n/)
      .map((name) => name.trim())
      .filter(owned);
  let names = await list();
  while (names.length) {
    try {
      const result = await call([
        "container",
        "inspect",
        "--format",
        "{{json .Name}} {{json .Config.Labels}}",
        ...names,
      ]);
      return sandboxes(engine, result.stdout);
    } catch (cause) {
      // A container removed between listing and inspection fails the batch.
      const current = new Set(await list());
      const remaining = names.filter((name) => current.has(name));
      if (remaining.length === names.length) throw cause;
      names = remaining;
    }
  }
  return [];
}

export function removeContainerSandbox(
  engine: ContainerEngine,
  name: string,
  options: ContainerInventoryOptions = {},
  executor: Executor = executeProcess,
): Promise<void> {
  return recoverContainer(engine, executor, name, options);
}
