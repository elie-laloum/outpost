export interface AgentInstaller {
  readonly binary: string;
  readonly package: string;
  readonly allowScripts?: boolean;
}
