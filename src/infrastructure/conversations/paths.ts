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
  return conversationLayout(format).remotePath(id, lease, original);
}
