import type { TransportStoreOptions } from "../domain/transport.types.ts";
export interface TransportConversationOptions extends TransportStoreOptions {
  readonly namespace: string;
}
