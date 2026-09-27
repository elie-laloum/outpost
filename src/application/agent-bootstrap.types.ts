export type AgentInstaller =
  | {
      readonly kind: "npm";
      readonly binary: string;
      readonly package: string;
      readonly allowScripts?: boolean;
    }
  | {
      readonly kind: "antigravity";
      readonly binary: string;
      readonly installed: string;
    };

export interface AgentInstallation {
  readonly target: string;
  readonly install: string;
}

export type AgentInstallations = {
  readonly [Kind in AgentInstaller["kind"]]: (
    installer: Extract<AgentInstaller, { kind: Kind }>,
    home: string,
  ) => AgentInstallation;
};
