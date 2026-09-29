import {
  payloadField,
  payloadNumber,
  payloadString,
} from "../../domain/trigger.ts";
import type { TriggerEvent } from "../../domain/trigger.types.ts";
import type { WorkflowJson } from "../../domain/workflow/checkpoint.types.ts";
import type {
  CommandReader,
  LabelReader,
  TriggerCommand,
  TriggerLabel,
} from "./triggers.types.ts";

function labelTitles(value: WorkflowJson | undefined): readonly string[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap(
    (label: WorkflowJson) => payloadString(label, "title") ?? [],
  );
}

function subject(
  source: TriggerLabel["source"],
  target: TriggerLabel["target"],
  repository: string | undefined,
  number: number | undefined,
) {
  if (!repository || number === undefined) return undefined;
  return { source, target, repository, number };
}

const githubLabel: LabelReader = (event, label) => {
  const issue = event.kind === "issues";
  if (
    (!issue && event.kind !== "pull_request") ||
    event.action !== "labeled" ||
    payloadString(event.payload, "label", "name") !== label
  )
    return undefined;
  return subject(
    "github",
    issue ? "issue" : "pull-request",
    payloadString(event.payload, "repository", "full_name"),
    payloadNumber(event.payload, issue ? "issue" : "pull_request", "number"),
  );
};

const gitlabLabel: LabelReader = (event, label) => {
  const labels = (state: string) =>
    labelTitles(payloadField(event.payload, "changes", "labels", state));
  if (
    !["issue", "merge_request"].includes(event.kind) ||
    labels("previous").includes(label) ||
    !labels("current").includes(label)
  )
    return undefined;
  return subject(
    "gitlab",
    event.kind === "issue" ? "issue" : "pull-request",
    payloadString(event.payload, "project", "path_with_namespace"),
    payloadNumber(event.payload, "object_attributes", "iid"),
  );
};

const labelReaders = new Map<string, LabelReader>([
  ["github", githubLabel],
  ["gitlab", gitlabLabel],
]);

/** Returns the labeled issue or pull/merge request when `label` was just added. */
export function labelAdded(
  event: TriggerEvent,
  label: string,
): TriggerLabel | undefined {
  const found = labelReaders.get(event.source)?.(event, label);
  return found && Object.freeze({ ...found, label });
}

function commandLine(body: string | undefined, command: string) {
  for (const line of (body ?? "").split(/\r?\n/)) {
    const text = line.trim();
    if (text === command || text.startsWith(`${command} `))
      return text.slice(command.length).trim();
  }
  return undefined;
}

function located(
  source: TriggerCommand["source"],
  text: string,
  repository: string | undefined,
  number: number | undefined,
  target: NonNullable<TriggerCommand["target"]>,
): TriggerCommand {
  return {
    source,
    text,
    ...(repository ? { repository } : {}),
    ...(number === undefined ? {} : { number, target }),
  };
}

const githubCommand: CommandReader = (event, command) => {
  if (event.kind !== "issue_comment" || event.action !== "created")
    return undefined;
  const text = commandLine(
    payloadString(event.payload, "comment", "body"),
    command,
  );
  if (text === undefined) return undefined;
  const pull = payloadField(event.payload, "issue", "pull_request");
  return located(
    "github",
    text,
    payloadString(event.payload, "repository", "full_name"),
    payloadNumber(event.payload, "issue", "number"),
    pull ? "pull-request" : "issue",
  );
};

const gitlabCommand: CommandReader = (event, command) => {
  if (event.kind !== "note" || (event.action && event.action !== "create"))
    return undefined;
  const text = commandLine(
    payloadString(event.payload, "object_attributes", "note"),
    command,
  );
  if (text === undefined) return undefined;
  const request = payloadNumber(event.payload, "merge_request", "iid");
  return located(
    "gitlab",
    text,
    payloadString(event.payload, "project", "path_with_namespace"),
    request ?? payloadNumber(event.payload, "issue", "iid"),
    request === undefined ? "issue" : "pull-request",
  );
};

const slackCommand: CommandReader = (event, command) => {
  if (event.kind !== "command" || event.action !== command) return undefined;
  return {
    source: "slack",
    text: (payloadString(event.payload, "text") ?? "").trim(),
  };
};

const commandReaders = new Map<string, CommandReader>([
  ["github", githubCommand],
  ["gitlab", gitlabCommand],
  ["slack", slackCommand],
]);

/** Returns the text after `command` in a new comment or a Slack slash command. */
export function commandIssued(
  event: TriggerEvent,
  command: string,
): TriggerCommand | undefined {
  if (!/^\S+$/.test(command))
    throw new Error("Trigger commands must be a single word such as /outpost");
  const found = commandReaders.get(event.source)?.(event, command);
  return found && Object.freeze(found);
}
