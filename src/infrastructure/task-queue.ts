import { mkdirSync, chmodSync } from "node:fs";
import { dirname, resolve } from "node:path";
import {
  queueClaim,
  queueJob,
  queueLease,
  queueLeaseMs,
  queueNumber,
  queueRequest,
  queueResult,
  queueString,
} from "../domain/task-queue.ts";
import type {
  DurableTaskQueue,
  QueueJob,
  QueueLease,
} from "../domain/task-queue.types.ts";

export async function sqliteTaskQueue(path: string): Promise<DurableTaskQueue> {
  const { DatabaseSync } = await import("node:sqlite");
  const file = resolve(path);
  mkdirSync(dirname(file), { recursive: true, mode: 0o700 });
  const db = new DatabaseSync(file);
  chmodSync(file, 0o600);
  db.exec(
    "PRAGMA busy_timeout=5000; PRAGMA synchronous=FULL; CREATE TABLE IF NOT EXISTS queue_jobs (id TEXT PRIMARY KEY, body TEXT NOT NULL, status TEXT NOT NULL, handler TEXT NOT NULL, expires INTEGER, deadline INTEGER); CREATE INDEX IF NOT EXISTS queue_eligible ON queue_jobs(status, handler, expires, deadline, id)",
  );
  function read(id: string): QueueJob | undefined {
    const row = db.prepare("SELECT body FROM queue_jobs WHERE id = ?").get(id);
    return row ? queueJob(JSON.parse(String(row.body))) : undefined;
  }
  function save(job: QueueJob): QueueJob {
    db.prepare(
      "INSERT INTO queue_jobs(id, body, status, handler, expires, deadline) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET body=excluded.body, status=excluded.status, handler=excluded.handler, expires=excluded.expires, deadline=excluded.deadline",
    ).run(
      job.id,
      JSON.stringify(job),
      job.status,
      job.handler,
      job.expires ?? null,
      job.deadline ?? null,
    );
    return job;
  }
  function transaction<T>(operation: () => T): T {
    db.exec("BEGIN IMMEDIATE");
    try {
      const result = operation();
      db.exec("COMMIT");
      return result;
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  }
  function expire(job: QueueJob): QueueJob {
    if (
      (job.status === "pending" || job.status === "active") &&
      job.deadline !== undefined &&
      job.deadline <= Date.now()
    )
      return save({ ...job, status: "cancelled", fence: job.fence + 1 });
    return job;
  }
  function required(id: string): QueueJob {
    const job = read(queueString(id));
    if (!job) throw new Error("Queue job does not exist");
    return expire(job);
  }
  function owned(input: QueueLease): QueueJob {
    const lease = queueLease(input);
    const job = required(lease.id);
    if (
      job.status !== "active" ||
      job.worker !== lease.worker ||
      job.fence !== lease.fence ||
      (job.expires ?? 0) <= Date.now()
    )
      throw new Error("Stale queue lease");
    return job;
  }
  return {
    async enqueue(input) {
      return transaction(() => {
        const request = queueRequest(input);
        const existing = read(request.id);
        if (existing) {
          if (
            JSON.stringify(queueRequest(existing)) !== JSON.stringify(request)
          )
            throw new Error("Queue identity already has a different request");
          return expire(existing);
        }
        return expire(save({ ...request, status: "pending", fence: 0 }));
      });
    },
    async get(id) {
      return transaction(() => {
        const job = read(queueString(id));
        return job ? expire(job) : undefined;
      });
    },
    async claim(input) {
      return transaction(() => {
        const claim = queueClaim(input);
        const now = Date.now();
        const placeholders = claim.handlers.map(() => "?").join(",");
        const selected = db
          .prepare(
            `SELECT id FROM queue_jobs INDEXED BY queue_eligible
           WHERE status IN ('pending', 'active') AND handler IN (${placeholders})
           AND (status = 'pending' OR expires <= ?)
           AND (deadline IS NULL OR deadline > ?)
           ORDER BY rowid LIMIT 1`,
          )
          .get(...claim.handlers, now, now);
        if (!selected) return undefined;
        const job = required(String(selected.id));
        if (job.status === "cancelled") return undefined;
        return save({
          ...job,
          status: "active",
          worker: claim.worker,
          fence: job.fence + 1,
          expires: Math.min(now + claim.leaseMs, job.deadline ?? Infinity),
        });
      });
    },
    async renew(lease, ms) {
      return transaction(() => {
        const job = owned(lease);
        return save({
          ...job,
          expires: Math.min(
            Date.now() + queueLeaseMs(ms),
            job.deadline ?? Infinity,
          ),
        });
      });
    },
    async complete(lease, input) {
      return transaction(() => {
        const job = owned(lease);
        const result = queueResult(input);
        return save({
          ...job,
          status: result.error === undefined ? "done" : "failed",
          result,
        });
      });
    },
    async cancel(id, fence) {
      return transaction(() => {
        const job = required(id);
        if (job.fence !== queueNumber(fence))
          throw new Error("Stale queue fence");
        if (job.status !== "pending" && job.status !== "active") return job;
        return save({ ...job, status: "cancelled", fence: job.fence + 1 });
      });
    },
    close() {
      db.close();
    },
  };
}
