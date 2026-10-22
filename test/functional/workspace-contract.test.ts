import { createLocalSandboxProvider } from "../../src/providers/local.ts";
import {
  defineWorkspaceContractSuite,
  workspaceContractTargets,
} from "../fixtures/workspace-contract.ts";

for (const target of workspaceContractTargets({
  name: "local",
  node: process.execPath,
  gitProvider: () => createLocalSandboxProvider(),
  fileProvider: () => createLocalSandboxProvider(),
}))
  defineWorkspaceContractSuite(target);
