import { invariant } from "../../domain/errors.ts";
import type {
  WorkspaceInput,
  WorkspaceRetention,
} from "../../domain/file-workspace.types.ts";
import type { Transport } from "../../domain/transport.types.ts";
import { captureWorkspaceOutputBaseline } from "../workspace-output-baseline.ts";
import { nativeRecipeGuards } from "./native.ts";
import { recipeZoneResource } from "./zones.ts";
import type { RecipeComponentScope } from "./components.types.ts";
import type { RecipeCheckpointSession } from "./durable.types.ts";
import type { RecipeFileWorkspaceDeclaration } from "./file-configuration.types.ts";
import type { RecipeProject } from "./project.types.ts";
import type { RecipeFileZone } from "./file-zones.types.ts";

function isTransport(value: unknown): value is Transport {
  return nativeRecipeGuards.transport!(value);
}

/** Resolves the Transports of each file workspace before any allocation. */
export async function prepareRecipeFileZones(
  project: RecipeProject,
  scope: RecipeComponentScope,
): Promise<Map<string, RecipeFileZone>> {
  const files = project.files;
  invariant(files, "Missing recipe file configuration");
  const declarations: [string, RecipeFileWorkspaceDeclaration][] = [
    ["workspace", files],
    ...Object.entries(project.model.workspaces).flatMap(([name, workspace]) =>
      workspace.kind === "files"
        ? [
            [`workspaces.${name}`, workspace.files] as [
              string,
              RecipeFileWorkspaceDeclaration,
            ],
          ]
        : [],
    ),
  ];
  const zones = new Map<string, RecipeFileZone>();
  for (const [key, declaration] of declarations) {
    let retention: WorkspaceRetention | undefined;
    if (declaration.retention?.policy === "portable") {
      const transporter = await scope.resolve(
        declaration.retention.transporter,
        "transport",
      );
      invariant(
        isTransport(transporter),
        "Invalid workspace retention Transport",
      );
      retention = { policy: "portable", transporter };
    }
    if (
      declaration.retention?.policy === "run" ||
      declaration.retention?.policy === "local"
    )
      retention = declaration.retention;
    const inputs: WorkspaceInput[] = await Promise.all(
      (declaration.inputs ?? []).map(async (input) => {
        if ("directory" in input) return input;
        const transporter = await scope.resolve(input.transporter, "transport");
        invariant(
          isTransport(transporter),
          "Invalid workspace input Transport",
        );
        return { snapshot: input.snapshot, transporter };
      }),
    );
    zones.set(key, {
      key,
      resource: recipeZoneResource(key),
      declaration,
      ...(retention ? { retention } : {}),
      inputs,
      baselines: [],
      workspace: undefined,
      context: undefined,
    });
  }
  return zones;
}

/** Captures publication baselines of the workspaces a resumed run has not recorded yet. */
export async function captureRecipeFileBaselines(
  zones: ReadonlyMap<string, RecipeFileZone>,
  session: RecipeCheckpointSession | undefined,
): Promise<void> {
  for (const zone of zones.values())
    if (!session?.resource(zone.resource))
      zone.baselines = await Promise.all(
        zone.declaration.outputs.map((output) =>
          captureWorkspaceOutputBaseline(output),
        ),
      );
}
