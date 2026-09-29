---
title: "conversations"
description: "conversations — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import { conversations } from "@elie-laloum/outpost";
```

## Rôle et comportement

Regroupe les utilitaires de conversations : transported construit un store adossé à un transport, harness le store des harness personnalisés, rewrite relocalise les cwd enregistrés et projectKey calcule le nom de dossier de projet Claude. Les helpers indexés par format native, locate, capture, restore, directory, destination et claudePath sont dépréciés ; utilisez à la place le store de chaque agent (createClaudeConversations(), createCodexConversations(), createCopilotConversations(), createKimiConversations()). Ces utilitaires ne gèrent pas l’authentification des agents.

[Exemple complet et règles détaillées](../../guide/agents/conversations/).

## Paramètres et propriétés

| Nom           | Type                                                                                                                                                                                                    | Présence | Rôle                                                                                                                                                                                                                          |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `transported` | `(base: ConversationStore \| ConversationFormat, options: TransportConversationOptions) => ConversationStore`                                                                                           | Requis   | Construit un store natif sur un transport de l’appelant avec un espace de noms stable du projet, incluant les transcripts enfants et la matérialisation locale.                                                               |
| `harness`     | `() => ConversationStore`                                                                                                                                                                               | Requis   | Crée le store de conversations par défaut des harness personnalisés, dont les transcriptions se trouvent dans .outpost/conversations/harness du dépôt cible.                                                                  |
| `rewrite`     | `(text: string, destination: string, source?: string) => string`                                                                                                                                        | Requis   | Réécrit les chemins de dépôt d’un transcript natif de source vers destination sans entrée/sortie fichier.                                                                                                                     |
| `projectKey`  | `(path: string) => string`                                                                                                                                                                              | Requis   | Encode un chemin de dépôt en clé de dossier de projet natif Claude.                                                                                                                                                           |
| `native`      | `(format: ConversationFormat) => NativeConversationStore`                                                                                                                                               | Requis   | Déprécié : renvoie le store natif intégré d’un nom de format ; utilisez la fonction create*Conversations() de l’agent.                                                                                                        |
| `locate`      | `(format: ConversationFormat, id: string, repository: string, home?: string) => Promise<ConversationLocation>`                                                                                          | Requis   | Déprécié : localise un transcript natif sur l’hôte par format, identifiant, dépôt et home optionnel. Utilisez plutôt la méthode locate() du store natif.                                                                      |
| `capture`     | `(format: ConversationFormat, id: string, repository: string, lease: SandboxLease, staging: string, options?: Pick<ConversationContext, "home" \| "warn" \| "local">) => Promise<ConversationLocation>` | Requis   | Déprécié : capture la conversation choisie depuis un bail de sandbox vers le dossier de capture hôte. Utilisez plutôt la méthode capture() du store natif.                                                                    |
| `restore`     | `(location: ConversationLocation, lease: SandboxLease, staging: string) => Promise<void>`                                                                                                               | Requis   | Déprécié : restaure un transcript localisé dans une sandbox et adapte ses chemins de dépôt. Utilisez plutôt la méthode restore() du store natif.                                                                              |
| `directory`   | `(format: ConversationFormat, repository: string, home?: string) => string`                                                                                                                             | Requis   | Déprécié : calcule le dossier hôte des transcripts pour le format et le dépôt choisis. Utilisez plutôt la méthode directory() du store natif.                                                                                 |
| `destination` | `(format: ConversationFormat, id: string, lease: SandboxLease, original: string) => string`                                                                                                             | Requis   | Déprécié : calcule la destination dans le home de sandbox ; Copilot/Kimi renvoient un chemin de staging du bundle, que restore doit matérialiser en fichiers natifs. Utilisez plutôt la méthode destination() du store natif. |
| `claudePath`  | `(id: string, repository: string, home?: string) => string`                                                                                                                                             | Requis   | Déprécié : calcule le chemin du transcript Claude hôte pour un identifiant et un dépôt. Utilisez plutôt createClaudeConversations().directory().                                                                              |

## Signature

```ts
export declare const conversations: Readonly<{
  transported: typeof createTransportConversations;
  harness: typeof createHarnessConversations;
  rewrite: typeof relocateTranscript;
  projectKey: typeof projectKey;
  /** @deprecated Use createClaudeConversations(), createCodexConversations(), createCopilotConversations() or createKimiConversations(). */
  native: typeof nativeConversations;
  /** @deprecated Use the native store's locate(). */
  locate(
    format: ConversationFormat,
    id: string,
    repository: string,
    home?: string,
  ): Promise<ConversationLocation>;
  /** @deprecated Use the native store's capture(). */
  capture(
    format: ConversationFormat,
    id: string,
    repository: string,
    lease: SandboxLease,
    staging: string,
    options?: Pick<ConversationContext, "home" | "warn" | "local">,
  ): Promise<ConversationLocation>;
  /** @deprecated Use the native store's restore(). */
  restore(
    location: ConversationLocation,
    lease: SandboxLease,
    staging: string,
  ): Promise<void>;
  /** @deprecated Use the native store's directory(). */
  directory(
    format: ConversationFormat,
    repository: string,
    home?: string,
  ): string;
  /** @deprecated Use the native store's destination(). */
  destination(
    format: ConversationFormat,
    id: string,
    lease: SandboxLease,
    original: string,
  ): string;
  /** @deprecated Use createClaudeConversations().directory(). */
  claudePath(id: string, repository: string, home?: string): string;
}>;
```

## Contrats associés

- [ConversationContext](../conversationcontext/)
- [ConversationFormat](../conversationformat/)
- [ConversationLocation](../conversationlocation/)
- [createHarnessConversations](../createharnessconversations/)
- [createTransportConversations](../createtransportconversations/)
- [nativeConversations](../support-nativeconversations/)
- [projectKey](../support-projectkey/)
- [relocateTranscript](../support-relocatetranscript/)
- [SandboxLease](../sandboxlease/)
