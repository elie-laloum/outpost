import type { ContainerPlanOptions } from "./container.types.ts";
import { containerUserNamespace } from "./container-egress.ts";

export function containerPlan({
  config,
  engine,
  user,
  root,
  name,
  image,
  volumes,
  fileParents,
}: ContainerPlanOptions): string[] {
  const networks =
    typeof config.networks === "string"
      ? [config.networks]
      : (config.networks ?? []);
  const args = [
    "create",
    "--name",
    name,
    "--init",
    "--user",
    `${user.uid}:${user.gid}`,
    ...(engine === "podman" && config.egress?.mode === "allowlist"
      ? ["--userns", `container:${name}-egress`]
      : containerUserNamespace(engine, config, user)),
    "--workdir",
    config.repositoryMode === "isolated" ? "/" : root,
    "--cap-drop",
    "ALL",
    ...(engine === "podman" ||
    fileParents.size ||
    config.caches?.length ||
    config.repositoryMode === "isolated"
      ? ["--cap-add", "CHOWN"]
      : []),
    "--security-opt",
    "no-new-privileges",
    "--tmpfs",
    engine === "podman"
      ? "/home/agent:rw,mode=0700"
      : `/home/agent:rw,uid=${fileParents.size ? 0 : user.uid},gid=${fileParents.size ? 0 : user.gid},mode=0700`,
    ...volumes,
    ...networks.flatMap((network) => ["--network", network]),
    ...(config.groups ?? []).flatMap((group) => ["--group-add", String(group)]),
    ...(config.devices ?? []).flatMap((device) => ["--device", device]),
    ...(config.cpus ? ["--cpus", String(config.cpus)] : []),
    ...(config.memoryMb ? ["--memory", `${config.memoryMb}m`] : []),
    "--entrypoint",
    "sleep",
    image,
    "infinity",
  ];

  return args;
}
