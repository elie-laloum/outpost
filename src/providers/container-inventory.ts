import { configurationInvariant } from "../domain/configuration-diagnostic.ts";
import { createDeadline } from "../domain/deadline.ts";
import { OutpostError } from "../domain/errors.ts";
import { executeProcess, requireSuccess } from "../infrastructure/process.ts";
import type { Executor } from "../infrastructure/process.types.ts";
import { containerEgress } from "./container-egress.constants.ts";
import type {
  ContainerSandbox,
  ContainerSandboxQuery,
} from "./container-inventory.types.ts";
import { containerLabels } from "./container-labels.constants.ts";
import { validateContainerLabels } from "./container-labels.ts";
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

const unreserved = (labels: ContainerLabels): ContainerLabels =>
  Object.freeze(
    Object.fromEntries(
      Object.entries(labels).filter(
        ([key]) =>
          !key.toLowerCase().startsWith(containerLabels.reservedPrefix),
      ),
    ),
  );

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
    found.set(sandbox, unreserved(labels));
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
  configurationInvariant(
    Object.keys(labels).length > 0,
    "Listing container sandboxes requires at least one label",
    ["labels"],
    "missing-container-label",
  );
  const durationMs = query.deadlineMs ?? containerDefaults.cleanupMs;
  const deadline = createDeadline({
    ...(query.signal ? { parent: query.signal } : {}),
    durationMs,
    reason: new OutpostError(
      "timeout",
      `Container inventory exceeded ${durationMs} ms`,
      { engine },
    ),
  });
  const call = (args: readonly string[]) =>
    requireSuccess(
      {
        executable: engine,
        arguments: args,
        deadlineMs: durationMs,
        signal: deadline.signal,
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
  try {
    let names = await list();
    while (names.length) {
      let output: string;
      try {
        output = (
          await call([
            "container",
            "inspect",
            "--format",
            "{{json .Name}} {{json .Config.Labels}}",
            ...names,
          ])
        ).stdout;
      } catch (cause) {
        // A container removed between listing and inspection fails the batch.
        const current = await list();
        if (names.every((name) => current.includes(name))) throw cause;
        names = current;
        continue;
      }
      return sandboxes(engine, output);
    }
    return [];
  } finally {
    deadline.close();
  }
}
