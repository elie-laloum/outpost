import type { Transport } from "../domain/transport.types.ts";
import type { DependencyCache } from "./container-cache.types.ts";

export interface CloudDependencyCache extends DependencyCache {
  readonly transport: Transport;
}
