import { join } from "node:path";
import { createClaudeConversations } from "../adapters/agents/claude/claude-conversations.ts";
import { builtInAgents } from "../adapters/agents/catalog.ts";
import type { AgentDescriptor } from "../adapters/agents/agent-descriptor.types.ts";
import type {
  ConversationContext,
  ConversationStore,
  NativeConversationStore,
} from "../domain/conversation.types.ts";
import { invariant } from "../domain/errors.ts";
import type { SandboxLease } from "../domain/sandbox.types.ts";
import type {
  ConversationFormat,
  ConversationLocation,
} from "../infrastructure/conversations.types.ts";
import { createHarnessConversations } from "../infrastructure/conversations/harness-store.ts";
import {
  projectKey,
  validId,
} from "../infrastructure/conversations/identity.ts";
import { relocateTranscript } from "../infrastructure/conversations/relocate.ts";
import { createTransportStore } from "../infrastructure/transport-conversations.ts";
import type { TransportConversationOptions } from "../infrastructure/transport-conversations.types.ts";

const agents: readonly AgentDescriptor[] = builtInAgents;

/** Resolves a built-in native format name to a new store. */
function nativeConversations(
  format: ConversationFormat,
): NativeConversationStore {
  const store = agents
    .map((agent) => agent.conversations?.())
    .find((candidate) => candidate?.format === format);
  invariant(store, "Unsupported conversation format");
  return store;
}

function formatStore(format: ConversationFormat): ConversationStore {
  return format === "harness"
    ? createHarnessConversations()
    : nativeConversations(format);
}

/**
 * Archives the conversations a base store captures through a transport.
 * A format name (deprecated) selects a built-in store.
 */
export function createTransportConversations(
  base: ConversationStore | ConversationFormat,
  options: TransportConversationOptions,
): ConversationStore {
  return createTransportStore(
    typeof base === "string" ? formatStore(base) : base,
    options,
  );
}

export const conversations = Object.freeze({
  transported: createTransportConversations,
  harness: createHarnessConversations,
  rewrite: relocateTranscript,
  projectKey,
  /** @deprecated Use createClaudeConversations(), createCodexConversations(), createCopilotConversations() or createKimiConversations(). */
  native: nativeConversations,
  /** @deprecated Use the native store's locate(). */
  locate(
    format: ConversationFormat,
    id: string,
    repository: string,
    home?: string,
  ): Promise<ConversationLocation> {
    return nativeConversations(format).locate(id, repository, home);
  },
  /** @deprecated Use the native store's capture(). */
  capture(
    format: ConversationFormat,
    id: string,
    repository: string,
    lease: SandboxLease,
    staging: string,
    options: Pick<ConversationContext, "home" | "warn" | "local"> = {},
  ): Promise<ConversationLocation> {
    return nativeConversations(format).capture(id, {
      repository,
      sandbox: lease,
      staging,
      ...options,
    });
  },
  /** @deprecated Use the native store's restore(). */
  restore(
    location: ConversationLocation,
    lease: SandboxLease,
    staging: string,
  ): Promise<void> {
    return nativeConversations(location.format).restore(location, {
      repository: lease.root,
      sandbox: lease,
      staging,
    });
  },
  /** @deprecated Use the native store's directory(). */
  directory(
    format: ConversationFormat,
    repository: string,
    home?: string,
  ): string {
    return nativeConversations(format).directory(repository, home);
  },
  /** @deprecated Use the native store's destination(). */
  destination(
    format: ConversationFormat,
    id: string,
    lease: SandboxLease,
    original: string,
  ): string {
    return nativeConversations(format).destination(id, lease, original);
  },
  /** @deprecated Use createClaudeConversations().directory(). */
  claudePath(id: string, repository: string, home?: string): string {
    validId(id);
    return join(
      createClaudeConversations().directory(repository, home),
      `${id}.jsonl`,
    );
  },
});
