import { invariant, OutpostError } from "../domain/errors.ts";
import type {
  ContainerCall,
  ContainerEngine,
  ContainerOptions,
  ContainerUser,
} from "./container.types.ts";

export async function containerPreflight(
  engine: ContainerEngine,
  platform: NodeJS.Platform,
  call: ContainerCall,
  config: ContainerOptions,
  image: string,
  user: ContainerUser,
): Promise<void> {
  if (engine === "podman" && platform === "darwin") {
    const machines = await call(["machine", "list", "--format", "json"]);
    const entries: unknown = JSON.parse(machines.stdout);
    invariant(
      Array.isArray(entries) &&
        entries.some(
          (machine) => machine.Running === true || machine.State === "running",
        ),
      "Start a Podman machine with podman machine start before creating a sandbox",
    );
  }
  const inspection = await call([
    "image",
    "inspect",
    "--format",
    "{{.Config.User}}",
    image,
  ]);
  const configuredUser = inspection.stdout.trim().split(":")[0];
  if (
    !config.user &&
    configuredUser &&
    /^\d+$/.test(configuredUser) &&
    Number(configuredUser) !== user.uid
  )
    throw new OutpostError(
      "provider",
      `Image UID ${configuredUser} does not match requested UID ${user.uid}`,
      { image, user },
    );
}
