import { posix } from "node:path";
import type { SandboxLease } from "../../domain/sandbox.types.ts";
import type { ConversationFormat } from "../conversations.types.ts";
import { validId } from "./identity.ts";
import { conversationLayout } from "./layout.ts";

export { projectKey, validId } from "./identity.ts";
export function remotePath(
  format: ConversationFormat,
  id: string,
  lease: SandboxLease,
  original: string,
): string {
  validId(id);
  if (format === "copilot" || format === "kimi")
    return posix.join(
      lease.home,
      ".outpost",
      "conversations",
      format,
      `${id}.json`,
    );
  return conversationLayout(format).remotePath(id, lease, original);
}
