import { fileURLToPath } from "node:url";
import { cloudCompatibilitySource } from "./fixtures/cloud-compatibility-source.ts";
import { daytona } from "../src/providers/daytona.ts";
import { vercel } from "../src/providers/vercel.ts";
import { runCloudCompatibility } from "./fixtures/cloud-compatibility.ts";

const source = await cloudCompatibilitySource(
  fileURLToPath(new URL("../", import.meta.url)),
);
const startedAt = new Date().toISOString();
const environment = process.env;
const reports = await runCloudCompatibility({
  environment,
  create(name) {
    if (name === "vercel")
      return vercel({
        create: {
          token: environment.VERCEL_TOKEN!,
          teamId: environment.VERCEL_TEAM_ID!,
          projectId: environment.VERCEL_PROJECT_ID!,
          runtime: "node24",
          timeout: 300_000,
        },
      });
    return daytona({
      connection: { apiKey: environment.DAYTONA_API_KEY! },
      create: {
        language: "typescript",
        autoStopInterval: 5,
        autoDeleteInterval: 0,
      },
    });
  },
});
console.log(
  JSON.stringify(
    { schemaVersion: 1, source, startedAt, node: process.version, reports },
    null,
    2,
  ),
);
process.exitCode = reports.some((report) => report.status === "fail")
  ? 1
  : reports.every((report) => report.status === "skipped")
    ? 2
    : 0;
