import type { RedisOptions } from "bullmq";

export interface BullMQConnection {
  readonly options: RedisOptions & {
    readonly retryStrategy: NonNullable<RedisOptions["retryStrategy"]>;
  };
  connected(): void;
  close(): void;
}
