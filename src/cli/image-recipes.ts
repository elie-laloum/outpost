import { builtInAgents } from "../adapters/agents/catalog.ts";
import type { AgentDescriptor } from "../adapters/agents/agent-descriptor.types.ts";
import {
  harnessImage,
  imageBase,
  imageFiles,
  imageSource,
  imageSystemPackages,
} from "./images.constants.ts";
import type {
  ContainerEngineName,
  ImageRecipe,
  ImageRecipeFile,
  OfficialImage,
} from "./images.types.ts";

/** Official images: the built-in harness, then one image per CLI agent. */
export const officialImages: readonly OfficialImage[] = Object.freeze([
  harnessImage,
  ...builtInAgents.map((agent) => ({
    name: agent.name,
    description: `${agent.label} ${agent.version} (${agent.executable})`,
    agent,
  })),
]);

export function officialImage(name: string): OfficialImage | undefined {
  return officialImages.find((image) => image.name === name);
}

export function officialImageNames(): string {
  return officialImages.map((image) => image.name).join(", ");
}

function installSteps(agent: AgentDescriptor, source: string): string[] {
  if (agent.install.kind === "script")
    return [
      `RUN ${agent.install.script(`/usr/local/bin/${agent.executable}`)}`,
    ];
  const prefix = `/opt/outpost/${agent.name}`;
  return [
    `COPY ${source}package.json ${source}package-lock.json ${prefix}/`,
    `RUN npm ci --prefix ${prefix} --omit=dev --no-audit --no-fund && npm cache clean --force`,
    `ENV PATH=${prefix}/node_modules/.bin:$PATH`,
  ];
}

function environment(agent: AgentDescriptor): string[] {
  return [
    ...(agent.image?.note === undefined ? [] : [`# ${agent.image.note}`]),
    ...Object.entries(agent.image?.variables ?? {}).map(
      ([name, value]) => `ENV ${name}=${value}`,
    ),
  ];
}

function composeRecipe(
  image: OfficialImage,
  agents: readonly AgentDescriptor[],
  source: (agent: AgentDescriptor) => string,
): string {
  // The Antigravity installer downloads its verified archive with curl.
  const packages = [
    ...imageSystemPackages,
    ...(agents.some((agent) => agent.install.kind === "script")
      ? ["curl"]
      : []),
  ];
  return [
    `FROM ${imageBase}`,
    "ARG AGENT_UID=1000",
    "ARG AGENT_GID=1000",
    `LABEL org.opencontainers.image.title="outpost-${image.name}" \\`,
    `      org.opencontainers.image.description="${image.description}" \\`,
    `      org.opencontainers.image.source="${imageSource}" \\`,
    '      org.opencontainers.image.licenses="MIT"',
    ...agents.map(
      (agent) =>
        `LABEL dev.outpost.agent.${agent.name}.version="${agent.version}"`,
    ),
    `RUN apt-get update && apt-get install -y --no-install-recommends ${packages.join(" ")} && rm -rf /var/lib/apt/lists/*`,
    ...agents.flatMap((agent) => installSteps(agent, source(agent))),
    'RUN groupmod -o -g "$AGENT_GID" node && usermod -o -u "$AGENT_UID" -g "$AGENT_GID" node',
    'RUN mkdir -p /home/agent && chown "$AGENT_UID:$AGENT_GID" /home/agent && chmod 700 /home/agent',
    "ENV HOME=/home/agent",
    ...agents.flatMap(environment),
    "# Add project tools here, as root, before the USER line.",
    "USER $AGENT_UID:$AGENT_GID",
    "WORKDIR /workspace",
    "",
  ].join("\n");
}

/** Container recipe for an official image, identical to the published build. */
export function imageRecipeText(image: OfficialImage): string {
  return composeRecipe(image, image.agent ? [image.agent] : [], () => "");
}

/** One recipe installing several agents, each from `<name>/` lockfiles. */
export function combinedImageRecipe(
  image: OfficialImage,
  agents: readonly AgentDescriptor[],
): string {
  return composeRecipe(image, agents, (agent) => `${agent.name}/`);
}

/** Every file needed to build an official image in an empty directory. */
export function imageRecipe(
  image: OfficialImage,
  engine: ContainerEngineName,
  lockfiles: readonly ImageRecipeFile[],
): ImageRecipe {
  const recipe = imageFiles[engine];
  return {
    image,
    recipe,
    files: [
      { path: recipe, content: imageRecipeText(image) },
      ...lockfiles,
      {
        path: ".dockerignore",
        content: [
          "*",
          `!${recipe}`,
          ...lockfiles.map((file) => `!${file.path}`),
          "",
        ].join("\n"),
      },
    ],
  };
}
