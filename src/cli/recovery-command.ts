import { recoveryRestoreCommand } from "./recovery-restore-command.ts";
import { recoveryPruneCommand } from "./recovery-prune-command.ts";
import { recoveryVerifyCommand } from "./recovery-verify-command.ts";
import { inspectRecovery } from "../application/recovery-inspection.ts";
import { invariant, positive } from "../domain/errors.ts";
import type { CliInvocation } from "./main.types.ts";
import { recoveryPublicationCommand } from "./recovery-publication-command.ts";
import { recoveryWorkspaceCommand } from "./recovery-workspace-command.ts";
import {
  inspectWorkspacePathLocks,
  inspectWorkspaceRegistryGate,
  recoverWorkspaceRegistryGate,
} from "../infrastructure/workspace-lock.ts";
import { createLocalTransport } from "../infrastructure/local-transport.ts";
import { join, resolve } from "node:path";

export async function recoveryCommand({
  values,
  positionals,
}: CliInvocation): Promise<void> {
  if (positionals[1] === "registry") {
    const action = positionals[2];
    invariant(
      positionals.length === 3 &&
        (action === "inspect" || action === "recover"),
      "Usage: outpost recovery registry inspect|recover [--revision DEVICE:INODE --processes-stopped]",
    );
    let gate = await inspectWorkspaceRegistryGate();
    if (action === "recover") {
      invariant(
        values["processes-stopped"] &&
          values.revision &&
          /^\d+:\d+$/.test(values.revision),
        "Registry recovery requires --processes-stopped and the inspected --revision DEVICE:INODE",
      );
      const [device, inode] = values.revision.split(":").map(Number);
      invariant(
        Number.isSafeInteger(device) && Number.isSafeInteger(inode),
        "Invalid registry revision",
      );
      await recoverWorkspaceRegistryGate(
        { device: device!, inode: inode! },
        { processesStopped: true },
      );
      gate = await inspectWorkspaceRegistryGate();
    }
    process.stdout.write(
      values.json
        ? `${JSON.stringify(gate ?? null)}\n`
        : gate
          ? `Registry revision: ${gate.device}:${gate.inode}\n`
          : "Registry gate is clear\n",
    );
    return;
  }
  if (positionals[1] === "publication")
    return recoveryPublicationCommand({ values, positionals });
  if (positionals[1] === "workspace")
    return recoveryWorkspaceCommand({ values, positionals });
  if (positionals[1] === "restore")
    return recoveryRestoreCommand({ values, positionals });
  if (positionals[1] === "prune")
    return recoveryPruneCommand({ values, positionals });
  if (positionals[1] === "verify")
    return recoveryVerifyCommand({ values, positionals });
  invariant(
    positionals.length === 2 && positionals[1] === "inspect",
    "Usage: outpost recovery inspect [--repository PATH] [--max-entries NUMBER] [--git] [--locks] [--resources] [--json]",
  );
  for (const key of Object.keys(values))
    invariant(
      [
        "repository",
        "runtime-directory",
        "max-entries",
        "git",
        "locks",
        "resources",
        "json",
      ].includes(key),
      `Unsupported recovery option: --${key}`,
    );
  const maxEntries =
    values["max-entries"] === undefined
      ? undefined
      : positive(Number(values["max-entries"]), "max-entries");
  if (values["runtime-directory"]) {
    invariant(
      !values.repository && !values.git,
      "Runtime inspection cannot request repository or Git state",
    );
    const runtimeDirectory = resolve(values["runtime-directory"]);
    const transport = createLocalTransport({
      directory: join(runtimeDirectory, "storage"),
    });
    const entries = [];
    for await (const entry of transport.list()) {
      if (entries.length >= (maxEntries ?? 1000)) break;
      entries.push(entry);
    }
    const registryGate = await inspectWorkspaceRegistryGate();
    const report = {
      runtimeDirectory,
      entries,
      ...(registryGate ? { registryGate } : {}),
      ...(values.locks && !registryGate
        ? { locks: await inspectWorkspacePathLocks() }
        : {}),
    };
    process.stdout.write(
      values.json
        ? `${JSON.stringify(report)}\n`
        : `Runtime: ${runtimeDirectory}\n${entries.length} stored objects\n`,
    );
    return;
  }
  const report = await inspectRecovery({
    ...(values.repository !== undefined
      ? { repository: values.repository }
      : {}),
    ...(maxEntries !== undefined ? { maxEntries } : {}),
    ...(values.git ? { git: true } : {}),
    ...(values.resources ? { resources: true } : {}),
    ...(values.locks ? { locks: true } : {}),
  });
  if (values.json) process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  else {
    process.stdout.write(
      `Outpost recovery inspection — ${JSON.stringify(report.repository)}\n`,
    );
    for (const category of report.categories) {
      process.stdout.write(
        `${category.name}: ${category.entries.length} listed entries\n`,
      );
      for (const entry of category.entries)
        process.stdout.write(
          `  ${JSON.stringify(entry.name)} | ${entry.kind} | ${entry.bytes} bytes | ${entry.files} files | ${entry.symlinks} symlinks | ${entry.modifiedAt ?? "unknown time"} | ${entry.complete ? "complete" : "partial"}\n`,
        );
    }
    if (report.git) {
      process.stdout.write(
        `Workspace Git inspection: ${report.git.complete ? "complete for listed entries" : "partial"}\n`,
      );
      for (const workspace of report.git.workspaces) {
        const detail =
          workspace.state === "registered"
            ? `${workspace.branch === null ? "detached HEAD" : JSON.stringify(workspace.branch)} | ${workspace.dirty ? "dirty" : "clean"} | ${workspace.head}${workspace.locked ? " | Git locked" : ""}`
            : workspace.state;
        process.stdout.write(
          `  ${JSON.stringify(workspace.name)} | ${detail}\n`,
        );
      }
      for (const issue of report.git.issues)
        process.stdout.write(
          `[PARTIAL] ${issue.code}: ${JSON.stringify(issue.path)}\n`,
        );
      process.stdout.write(
        "Git status excludes ignored files. Clean does not mean safe to delete.\n",
      );
    }
    if (report.locks) {
      process.stdout.write(
        `Lock PID inspection (local host): ${report.locks.complete ? "complete for listed entries" : "partial"}\n`,
      );
      for (const lock of report.locks.entries) {
        const pid = "pid" in lock ? ` | PID ${lock.pid}` : "";
        const reason = "reason" in lock ? ` | ${lock.reason}` : "";
        process.stdout.write(
          `  ${JSON.stringify(lock.name)} | ${lock.state}${pid}${reason}${lock.ownership ? ` | ownership ${lock.ownership.status}: ${lock.ownership.reason}` : ""}\n`,
        );
      }
      for (const issue of report.locks.issues)
        process.stdout.write(
          `[PARTIAL] ${issue.code}: ${JSON.stringify(issue.path)}\n`,
        );
      process.stdout.write(
        "PID presence does not prove lock ownership; PID absence does not authorize deletion.\n",
      );
    }
    if (report.resources) {
      process.stdout.write(
        `Recorded sandbox activity: ${report.resources.complete ? "complete for listed records" : "partial"}\n`,
      );
      for (const entry of report.resources.entries) {
        const detail = entry.record
          ? `${JSON.stringify(entry.record.sandboxProvider)} | ${entry.record.phase} | ${entry.record.operations.map((operation) => `${operation.kind} (${operation.count})`).join(", ") || "idle"}`
          : "unreadable";
        process.stdout.write(
          `  ${JSON.stringify(entry.path)} | ${detail} | ownership ${entry.ownership.status}: ${entry.ownership.reason}\n`,
        );
      }
      for (const issue of report.resources.issues)
        process.stdout.write(
          `[PARTIAL] ${issue.code}: ${JSON.stringify(issue.path)}\n`,
        );
      process.stdout.write(
        "Recorded activity is a snapshot; stale or unknown ownership does not authorize resource deletion. Provider resources are not queried.\n",
      );
    }
    for (const issue of report.issues)
      process.stdout.write(
        `[PARTIAL] ${issue.code}: ${JSON.stringify(issue.path)}\n`,
      );
    process.stdout.write(
      `Total observed: ${report.usage.bytes} bytes in ${report.usage.files} files; ${report.scannedEntries}/${report.maxEntries} entries scanned.\n`,
    );
    process.stdout.write(
      `${report.complete ? "Inventory complete." : "Inventory incomplete; totals are partial."} File sizes are logical bytes; symlink targets are excluded.\n`,
    );
    process.stdout.write(
      report.git || report.locks || report.resources
        ? "Activity and recovery integrity are unverified. No raw file contents were displayed or files removed.\n"
        : "Activity and recovery integrity are unverified. No files were read for content or removed.\n",
    );
  }
  if (
    !report.complete ||
    report.git?.complete === false ||
    report.locks?.complete === false ||
    report.resources?.complete === false
  )
    process.exitCode = 1;
}
