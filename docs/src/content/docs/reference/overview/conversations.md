---
title: "Conversations — Overview"
description: "A conversation is the agent’s native history, stored separately from Git files and sandbox resources."
sidebar:
  label: Overview
  order: 0
---

A conversation is the agent’s native history, stored separately from Git files and sandbox resources. Preserving that history lets a later execution continue an investigation without pretending that reusing a branch also restores the agent’s context.

## How it works

A conversation store locates, captures and restores native transcripts. Continuation resumes an identity; a fork starts an alternative from captured context. Repository-path relocation adapts transcripts when the environment changes. Claude and Codex provide native stores; a custom store implements the same persistence port.

## Boundaries and responsibilities

Forking a conversation does not fork its files. Choose a separate workspace when alternatives must remain isolated. Authentication is independent of transcript storage, and transcripts may contain sensitive content. Gemini currently has no native capture, resume or fork support.

## Entry points

- [conversations](../../conversations/)
- [ConversationStore](../../conversationstore/)
- [ConversationContext](../../conversationcontext/)
- [ConversationRecord](../../conversationrecord/)
- [ConversationFormat](../../conversationformat/)

[Learn with the practical guide](../../../guide/agents/conversations/).
