import { randomUUID } from "node:crypto";
import { openBullMQResources } from "./task-queue-bullmq-resources.ts";
import {
  queueClaim,
  queueLease,
  queueLeaseMs,
  queueNumber,
  queueRequest,
  queueResult,
  queueString,
} from "../domain/task-queue.ts";
import type { QueueJob, QueueLease } from "../domain/task-queue.types.ts";
import type {
  BullMQTaskQueueOptions,
  BullMQTaskQueue,
  BullMQJob,
} from "./task-queue-bullmq.types.ts";
import { bullMQKey, bullMQState } from "./task-queue-bullmq-state.ts";
import {
  bullMQClaimBatchSize,
  bullMQStateScript,
} from "./task-queue-bullmq.constants.ts";

export type {
  BullMQTaskQueueOptions,
  BullMQTaskQueue,
} from "./task-queue-bullmq.types.ts";

export async function bullmqTaskQueue(
  options: BullMQTaskQueueOptions,
): Promise<BullMQTaskQueue> {
  const resources = await openBullMQResources(options);
  const { root, prefix, nativeName, nativeKey, handlerQueue, perform, report } =
    resources;
  let cursor = 0;
  const client = await root.client;
  client.defineCommand("outpostQueueStateV1", {
    numberOfKeys: 3,
    lua: bullMQStateScript,
  });
  async function state(
    id: string,
    operation: string,
    args: readonly (string | number)[] = [],
    handler = "",
  ) {
    return bullMQState(
      await client.runCommand("outpostQueueStateV1", [
        `${root.qualifiedName}:outpost:${bullMQKey(id)}`,
        `${nativeKey(handler, id)}:lock`,
        `${prefix}:${nativeName(handler)}:stalled`,
        operation,
        ...args,
      ]),
    );
  }
  async function required(id: string) {
    const current = await state(id, "get");
    if (!current) throw new Error("Queue job does not exist");
    return current;
  }
  async function settle(native: BullMQJob, job: QueueJob, token: string) {
    try {
      if (job.status === "done") {
        await native.moveToCompleted(job.result!, token, false);
        return;
      }
      await native.moveToFailed(
        new Error(job.result?.error ?? "Queue job cancelled"),
        token,
        false,
      );
    } catch (error) {
      report(error);
    }
  }
  async function ownedOperation(
    input: QueueLease,
    operation: "renew" | "complete",
    value: string | number,
    extra: string,
  ) {
    const lease = queueLease(input);
    const previous = await required(lease.id);
    const current = await state(
      lease.id,
      operation,
      [lease.worker, lease.fence, value, extra],
      previous.job.handler,
    );
    if (!current) throw new Error("Queue job does not exist");
    return current;
  }
  return {
    enqueue(input) {
      return perform(async () => {
        const request = queueRequest(input);
        await state(request.id, "enqueue", [
          JSON.stringify(request),
          request.deadline ?? "",
        ]);
        const { queue } = await handlerQueue(request.handler);
        await queue.add(request.handler, request, {
          jobId: bullMQKey(request.id),
          removeOnComplete: false,
          removeOnFail: false,
        });
        return (await required(request.id)).job;
      });
    },
    get(id) {
      return perform(async () => (await state(queueString(id), "get"))?.job);
    },
    claim(input) {
      return perform(async () => {
        const claim = queueClaim(input);
        const eligible = [...new Set(claim.handlers)];
        const start = cursor++ % eligible.length;
        for (let index = 0; index < eligible.length; index++) {
          const handler = eligible[(start + index) % eligible.length]!;
          const { worker } = await handlerQueue(handler);
          for (let attempt = 0; attempt < bullMQClaimBatchSize; attempt++) {
            const token = randomUUID();
            const native = await worker.getNextJob(token, { block: false });
            if (!native) break;
            const request = queueRequest(native.data);
            const current = await state(
              request.id,
              "claim",
              [claim.worker, token, claim.leaseMs, native.id!],
              handler,
            );
            if (!current) throw new Error("Queue job does not exist");
            if (current.job.status === "active") return current.job;
            await settle(native, current.job, token);
          }
        }
        return undefined;
      });
    },
    renew(lease, leaseMs) {
      return perform(async () => {
        return (
          await ownedOperation(
            lease,
            "renew",
            queueLeaseMs(leaseMs),
            bullMQKey(lease.id),
          )
        ).job;
      });
    },
    complete(lease, input) {
      return perform(async () => {
        const result = queueResult(input);
        const current = await ownedOperation(
          lease,
          "complete",
          JSON.stringify(result),
          result.error === undefined ? "done" : "failed",
        );
        const { queue } = await handlerQueue(current.job.handler);
        const native = await queue.getJob(bullMQKey(lease.id));
        if (native && current.token)
          await settle(native, current.job, current.token);
        return current.job;
      });
    },
    cancel(id, fence) {
      return perform(async () => {
        const current = await state(queueString(id), "cancel", [
          queueNumber(fence),
        ]);
        if (!current) throw new Error("Queue job does not exist");
        return current.job;
      });
    },
    close: resources.close,
  };
}
