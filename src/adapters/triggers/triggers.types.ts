import type {
  TriggerEvent,
  TriggerHttpRequest,
  TriggerSecret,
} from "../../domain/trigger.types.ts";

export interface GithubWebhookOptions {
  /** Webhook secret verifying `X-Hub-Signature-256`. */
  readonly secret: TriggerSecret;
}

export interface GitlabSigningOptions {
  /** `whsec_` signing token verifying `webhook-signature` (GitLab 19.0+). */
  readonly signingToken: TriggerSecret;
  readonly toleranceMs?: number;
}

export interface GitlabTokenOptions {
  /** Plain-text `X-Gitlab-Token`; weaker, since the request body is not signed. */
  readonly token: TriggerSecret;
}

export type GitlabWebhookOptions = GitlabSigningOptions | GitlabTokenOptions;

export interface SlackRequestOptions {
  /** App signing secret verifying `X-Slack-Signature`. */
  readonly signingSecret: TriggerSecret;
  readonly toleranceMs?: number;
}

export interface StandardWebhookOptions {
  /** `whsec_` secret verifying Standard Webhooks signatures. */
  readonly secret: TriggerSecret;
  readonly toleranceMs?: number;
  /** Event source name; defaults to `standard`. */
  readonly source?: string;
}

export interface TriggerLabel {
  readonly source: "github" | "gitlab";
  /** `owner/name` on GitHub, `group/project` on GitLab. */
  readonly repository: string;
  /** Issue or pull request number; merge request IID on GitLab. */
  readonly number: number;
  readonly target: "issue" | "pull-request";
  readonly label: string;
}

export interface TriggerCommand {
  readonly source: "github" | "gitlab" | "slack";
  /** Text following the command, trimmed. */
  readonly text: string;
  readonly repository?: string;
  readonly number?: number;
  readonly target?: "issue" | "pull-request";
}

export type DeliveryVerifier = (
  request: TriggerHttpRequest,
  now: number,
) => Promise<string>;

export type LabelReader = (
  event: TriggerEvent,
  label: string,
) => Omit<TriggerLabel, "label"> | undefined;

export type CommandReader = (
  event: TriggerEvent,
  command: string,
) => TriggerCommand | undefined;
