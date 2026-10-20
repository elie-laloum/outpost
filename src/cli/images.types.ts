import type { AgentDescriptor } from "../adapters/agents/agent-descriptor.types.ts";

export type ContainerEngineName = "docker" | "podman";

export interface OfficialImage {
  /** Name accepted by --image, e.g. "codex" or "harness". */
  readonly name: string;
  readonly description: string;
  /** Agent installed in the image; absent for the harness image. */
  readonly agent?: AgentDescriptor;
}

export interface ImageRecipeFile {
  readonly path: string;
  readonly content: string;
}

export interface ImageRecipe {
  readonly image: OfficialImage;
  /** Recipe filename for the selected engine. */
  readonly recipe: string;
  readonly files: readonly ImageRecipeFile[];
}

export interface EjectOptions {
  readonly image: string;
  readonly directory?: string;
  readonly engine?: ContainerEngineName;
  readonly force?: boolean;
}

export interface BuildOptions {
  readonly directory?: string;
  readonly engine?: ContainerEngineName;
  readonly tag?: string;
  readonly file?: string;
  readonly uid?: number;
  readonly gid?: number;
}

export interface ImageReference {
  readonly name: string;
  readonly reference: string;
}
