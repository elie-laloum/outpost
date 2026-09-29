import type { NativeConversationStore } from "../../../domain/conversation.types.ts";
import { createSessionBundleConversations } from "../../../infrastructure/conversations/session-bundle.ts";
import type { SessionBundleProfile } from "../../../infrastructure/conversations/session-bundle.types.ts";

export const kimiSessionProfile: SessionBundleProfile = {
  format: "kimi",
  root: { variable: "KIMI_CODE_HOME", directory: ".kimi-code" },
  sessions: "sessions",
  buckets: true,
  include: /^/,
  exclude: /^(?:logs|tasks|cron|notify)(?:\/|$)|(?:^|\/)[^/]*\.lock$/,
  required: ["state.json", "agents/main/wire.jsonl"],
  relocated: ["state.json"],
  validate: (files, id) => {
    const meta = JSON.parse(files.text("state.json") ?? "null");
    const supported =
      meta?.version === 2 &&
      meta.id === id &&
      typeof meta.cwd === "string" &&
      meta.agents &&
      typeof meta.agents === "object";
    return supported ? undefined : "Unsupported Kimi session metadata";
  },
  bucket: (cwd, { sha256 }) => {
    const normalized = cwd.replace(/\\/g, "/").replace(/\/+$/, "");
    let slug = (normalized.split("/").pop() ?? "")
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40)
      .replace(/^-+|-+$/g, "");
    if (!slug || slug === "." || slug === "..") slug = "workspace";
    return `wd_${slug}_${sha256(normalized).slice(0, 12)}`;
  },
  relocate: (_path, text, { cwd, target, helpers }) => {
    const meta = JSON.parse(text);
    meta.cwd = cwd;
    for (const [agent, value] of Object.entries(meta.agents)) {
      if (
        !/^[A-Za-z0-9_-]+$/.test(agent) ||
        !value ||
        typeof value !== "object"
      )
        throw new Error("Invalid Kimi agent metadata");
      Object.assign(value, { homedir: helpers.join(target, "agents", agent) });
    }
    return JSON.stringify(meta);
  },
};

/** Creates the native store for Kimi Code session directories. */
export function createKimiConversations(): NativeConversationStore {
  return createSessionBundleConversations(kimiSessionProfile);
}
