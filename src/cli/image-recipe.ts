import type { AgentDescriptor } from "../adapters/agents/agent-descriptor.types.ts";
import { builtInAgents } from "../adapters/agents/catalog.ts";

const agents: readonly AgentDescriptor[] = builtInAgents;

/** Dockerfile steps that install every built-in agent CLI. */
export function agentInstallSteps(): string {
  const packages = agents.flatMap(({ install, version }) =>
    install.kind === "npm" ? [{ ...install, version }] : [],
  );
  const scripted = packages
    .filter((install) => install.allowScripts)
    .map((install) => install.package);
  const allowScripts = scripted.length
    ? ` --allow-scripts=${scripted.join(",")}`
    : "";
  // prepare-agent-image.mjs replaces this npm line, so it must stay a single line.
  const npm = `RUN npm install -g${allowScripts} ${packages.map((install) => `${install.package}@${install.version}`).join(" ")}`;
  const scripts = agents.flatMap(({ install, executable }) =>
    install.kind === "script"
      ? [`RUN ${install.script(`/usr/local/bin/${executable}`)}`]
      : [],
  );
  return [npm, ...scripts].join("\n");
}

/** Dockerfile environment lines that built-in agents require. */
export function agentImageEnvironment(): string {
  return agents
    .flatMap(({ image }) => [
      ...(image?.note === undefined ? [] : [`# ${image.note}`]),
      ...Object.entries(image?.variables ?? {}).map(
        ([name, value]) => `ENV ${name}=${value}`,
      ),
    ])
    .join("\n");
}
