import { randomUUID } from "node:crypto";
import { mkdir, mkdtemp } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import type { ConversationStore } from "../domain/conversation.types.ts";
import { invariant } from "../domain/errors.ts";
import { transportKey } from "../domain/transport.ts";
import type { StoredConversationFormat } from "./conversations.types.ts";
import { harnessConversations } from "./conversations/harness-store.ts";
import type { TransportConversationOptions } from "./transport-conversations.types.ts";
import { nativeConversations } from "./conversations/native-store.ts";
import { files } from "./conversations/files.ts";
import { validId } from "./conversations/paths.ts";
import { jsonBytes, jsonObject, transportReference } from "./transport-json.ts";
import { archiveFiles, restoreArchiveFiles } from "./transport-archive.ts";
import { safeDestination } from "./files.ts";

const baseStores: Readonly<
  Record<StoredConversationFormat, () => ConversationStore>
> = {
  claude: () => nativeConversations("claude"),
  codex: () => nativeConversations("codex"),
  harness: harnessConversations,
};

export function transportConversations(
  format: StoredConversationFormat,
  options: TransportConversationOptions,
): ConversationStore {
  invariant(
    Object.hasOwn(baseStores, format),
    "Unsupported conversation format",
  );
  const native = baseStores[format]();
  const prefix = `conversations/${transportKey(options.namespace)}/${format}`;
  const key = (id: string) => {
    validId(id);
    return `${prefix}/${id}/index`;
  };
  return {
    name: `transport:${options.namespace}:${format}`,
    async locate(id, repository) {
      const current = await options.transporter.read(key(id));
      invariant(current, "Conversation does not exist");
      const value: unknown = jsonObject(current);
      invariant(
        value &&
          typeof value === "object" &&
          "archive" in value &&
          "file" in value &&
          typeof value.file === "string",
        "Invalid conversation index",
      );
      const staging = join(repository, ".outpost", "recovery", "conversations");
      await mkdir(staging, { recursive: true, mode: 0o700 });
      const parent = await mkdtemp(join(staging, "materialized-"));
      const destination = join(parent, "transcript");
      await restoreArchiveFiles(
        options.transporter,
        transportReference(value.archive),
        destination,
      );
      const file = await safeDestination(destination, value.file);
      return {
        id,
        file,
        format,
        reference: { key: current.key, revision: current.revision },
      };
    },
    async capture(id, context) {
      const target = key(id);
      const previous = await options.transporter.read(target);
      await mkdir(context.staging, { recursive: true, mode: 0o700 });
      const home = await mkdtemp(join(context.staging, "captured-"));
      const captured = await native.capture(id, { ...context, home });
      const root = dirname(captured.file);
      const selected = [
        captured.file,
        ...(await files(join(root, id, "subagents"))),
      ];
      const archive = await archiveFiles(
        options.transporter,
        root,
        selected.map((file) => relative(root, file).replaceAll("\\", "/")),
        `${prefix}/${id}/snapshots/${randomUUID()}`,
      );
      const reference = await options.transporter.write(
        target,
        jsonBytes({
          archive,
          file: relative(root, captured.file).replaceAll("\\", "/"),
        }),
        { ifRevision: previous?.revision ?? null },
      );
      return {
        ...captured,
        reference: { key: reference.key, revision: reference.revision },
      };
    },
    restore(record, context) {
      return native.restore(record, context);
    },
  };
}
