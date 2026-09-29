import { join } from "node:path";
import { createLocalTransport } from "./local-transport.ts";
import type { Transport } from "../domain/transport.types.ts";
import { repositoryStorageDirectory } from "./repository-transport.constants.ts";

export function repositoryTransport(repository: string): Transport {
  return createLocalTransport({
    directory: join(repository, ".outpost", repositoryStorageDirectory),
  });
}
