import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { trace, metrics } from "@opentelemetry/api";
import { createLocalSandboxProvider } from "../../src/providers/local.ts";
import { git } from "../../src/infrastructure/git.ts";
import { emit, scripted } from "../helpers.ts";
import type {
  SpeculativeValidation,
  SandboxProvider,
  WorkflowJson,
  AgentObservation,
} from "../../src/index.ts";

export function candidate() {
  return scripted(
    `import {writeFileSync} from 'node:fs';import {execFileSync} from 'node:child_process';writeFileSync('base.txt','candidate\\n');execFileSync('git',['add','.']);execFileSync('git',['commit','-m','Candidate']);console.log(JSON.stringify({kind:'usage',tokens:{input:3,cached:0,output:2}}));${emit("candidate")}`,
  );
}
export function resolver() {
  return scripted(
    `import {writeFileSync} from 'node:fs';import {execFileSync} from 'node:child_process';writeFileSync('base.txt','host + candidate\\n');execFileSync('git',['add','.']);execFileSync('git',['commit','-m','Resolve']);console.log(JSON.stringify({kind:'usage',tokens:{input:7,cached:0,output:4}}));${emit("resolved")}`,
  );
}
export async function hostEdit(value: WorkflowJson) {
  if (typeof value !== "string") throw new Error("Expected repository path");
  await writeFile(join(value, "base.txt"), "host\n");
  await git(value, ["commit", "-am", "Host change"]);
  return true;
}
export const validate = ({ result }: SpeculativeValidation<unknown>) =>
  result.text === "candidate";
export const score = () => 1;
export const output: string[] = [];
export const events: AgentObservation[] = [];
export const write = (value: string) => {
  output.push(value);
};
export const summary = (value: AgentObservation) => {
  events.push(value);
};
export const tracer = trace.getTracer("recipe-test");
export const meter = metrics.getMeter("recipe-test");
export const acquire = createLocalSandboxProvider().acquire;
export function provider(): SandboxProvider {
  const local = createLocalSandboxProvider();
  return {
    ...local,
    recover: async () => {},
    async acquire(context) {
      await context.registerRecovery?.("recipe-fixture");
      return local.acquire(context);
    },
  };
}
