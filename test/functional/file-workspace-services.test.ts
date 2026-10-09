import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, readFile, writeFile, rm, stat } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { setTimeout as delay } from "node:timers/promises";
import {
  createRecipeRuntime,
  validateRecipeProject,
} from "../../src/recipes.ts";
import { createSqliteTaskQueue } from "../../src/index.ts";
import type { QueueJob, TaskQueue } from "../../src/index.ts";

async function settled(queue: TaskQueue, id: string): Promise<QueueJob> {
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    const job = await queue.get(id);
    if (job && job.status !== "pending" && job.status !== "active") return job;
    await delay(20);
  }
  throw new Error(`File job did not settle: ${id}`);
}

test("configuration 3 schedules only enqueue, and concurrent workers allocate independent file roots", async () => {
  const directory = await mkdtemp(join(tmpdir(), "outpost-file-services-"));
  try {
    const file = join(directory, "recipe.yaml"),
      config = join(directory, "outpost.yaml");
    await writeFile(
      file,
      JSON.stringify({
        version: 3,
        name: "file-job",
        inputs: {
          label: {
            type: "string",
            description: "Output label",
            default: "scheduled",
          },
        },
        workflow: {
          checkpoint: {
            store: { $ref: "stores.state" },
            runId: "default",
            version: "1",
          },
        },
        tasks: [
          {
            key: "produce",
            command: {
              executable: process.execPath,
              arguments: [
                "-e",
                "const fs=require('fs'),root=process.argv[2],label=process.argv[1];fs.mkdirSync(root,{recursive:true});fs.writeFileSync(root+'/'+label,'started');fs.writeFileSync('same.json',label);const end=Date.now()+5000;const wait=setInterval(()=>{if(fs.readdirSync(root).length>=2){clearInterval(wait);process.stdout.write(process.cwd());return}if(Date.now()>end){clearInterval(wait);process.exitCode=8}},10)",
                "{{inputs.label}}",
                join(directory, "barrier"),
              ],
            },
          },
        ],
      }),
    );
    await writeFile(
      config,
      JSON.stringify({
        version: 3,
        runtime: { directory: "./control", namespace: "file-jobs" },
        workspace: { kind: "ephemeral", retention: { policy: "local" } },
        sandbox: { provider: "local" },
        transports: { state: { type: "local", directory: "./state" } },
        stores: {
          state: {
            type: "transport",
            transporter: { $ref: "transports.state" },
          },
        },
        queues: { jobs: { type: "sqlite", file: "./jobs.sqlite" } },
        jobs: {
          apply: {
            type: "recipe",
            file: "./recipe.yaml",
            config: "./outpost.yaml",
          },
        },
        crons: {
          minute: {
            type: "schedule",
            expression: "* * * * *",
            timeZone: "UTC",
          },
        },
        schedules: {
          minute: {
            type: "cron",
            name: "minute",
            cron: { $ref: "crons.minute" },
            handler: "apply",
            input: { label: "scheduled" },
          },
        },
        services: {
          second: {
            type: "worker",
            queue: { $ref: "queues.jobs" },
            worker: "file-worker-2",
            pollMs: 10,
            handlers: { apply: { $ref: "jobs.apply" } },
          },
          clock: {
            type: "schedules",
            queue: { $ref: "queues.jobs" },
            schedules: [{ $ref: "schedules.minute" }],
          },
          worker: {
            type: "worker",
            queue: { $ref: "queues.jobs" },
            worker: "file-worker",
            pollMs: 10,
            handlers: { apply: { $ref: "jobs.apply" } },
          },
        },
      }),
    );
    await validateRecipeProject({ file, config });
    await using clock = await createRecipeRuntime({ file, config });
    const scheduling = clock.serve({ service: "clock" });
    const queue = await createSqliteTaskQueue(join(directory, "jobs.sqlite"));
    try {
      let scheduled: QueueJob | undefined;
      const slot = new Date(
        Math.floor(Date.now() / 60000) * 60000,
      ).toISOString();
      const id = `schedule:minute:${slot}`;
      for (let attempt = 0; attempt < 200 && !scheduled; attempt++) {
        scheduled = await queue.get(id);
        if (!scheduled) await delay(10);
      }
      assert.equal(scheduled?.status, "pending");
      await assert.rejects(
        stat(join(directory, "control", "workspaces")),
        /ENOENT/,
      );
      await clock.close();
      await scheduling;
      await using publisher = await createRecipeRuntime({ file, config });
      await publisher.enqueue({
        queue: "jobs",
        handler: "apply",
        runId: "manual",
        inputs: { label: "manual" },
      });
      await using worker = await createRecipeRuntime({ file, config });
      const working = worker.serve({ service: "worker" });
      await using second = await createRecipeRuntime({ file, config });
      const secondWorking = second.serve({ service: "second" });
      const [left, right] = await Promise.all([
        settled(queue, id),
        settled(queue, "recipe:apply:manual"),
      ]);
      await worker.close();
      await working;
      await second.close();
      await secondWorking;
      for (const job of [left, right])
        assert.equal(job.status, "done", JSON.stringify(job.result));
      const statuses = await Promise.all([
        publisher.status(`minute:${slot}`),
        publisher.status("manual"),
      ]);
      const roots = statuses.map((status) => {
        const report = status?.report;
        assert.ok(
          report &&
            typeof report === "object" &&
            !Array.isArray(report) &&
            "workspaceInfo" in report,
        );
        const info = report.workspaceInfo;
        assert.ok(
          info &&
            typeof info === "object" &&
            !Array.isArray(info) &&
            typeof info.directory === "string",
        );
        return info.directory;
      });
      assert.notEqual(roots[0], roots[1]);
      assert.equal(
        await readFile(join(roots[0]!, "same.json"), "utf8"),
        "scheduled",
      );
      assert.equal(
        await readFile(join(roots[1]!, "same.json"), "utf8"),
        "manual",
      );
      await rm(join(directory, "barrier"), { recursive: true });
      await publisher.enqueue({
        queue: "jobs",
        handler: "apply",
        runId: "manual",
        inputs: { label: "manual" },
        id: "redelivery",
      });
      await using redelivery = await createRecipeRuntime({ file, config });
      const rerunning = redelivery.serve({ service: "worker" });
      assert.equal((await settled(queue, "redelivery")).status, "done");
      await redelivery.close();
      await rerunning;
      assert.equal(
        await readFile(join(roots[1]!, "same.json"), "utf8"),
        "manual",
      );
    } finally {
      queue.close();
      await clock.close();
      await scheduling;
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
