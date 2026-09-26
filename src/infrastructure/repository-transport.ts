import { join } from "node:path";
import { localTransport } from "./local-transport.ts";
import type { Transport } from "../domain/transport.types.ts";
import { repositoryStorageDirectory } from "./repository-transport.constants.ts";

export function repositoryTransport(repository: string): Transport {
  return localTransport({
    directory: join(repository, ".outpost", repositoryStorageDirectory),
  });
}
