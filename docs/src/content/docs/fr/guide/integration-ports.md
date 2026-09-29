---
title: "Ports d’intégration"
description: "Étendre une capacité sans remplacer le runtime."
---

Implémentez le contrat responsable du comportement voulu. Gardez indépendants protocoles CLI, environnements d’exécution et persistance.

| Contrat                            | Responsabilité                                                                     |
| ---------------------------------- | ---------------------------------------------------------------------------------- |
| `AgentAdapter`                     | Construire les requêtes CLI, planifier les identifiants et décoder les événements. |
| `SandboxProvider` / `SandboxLease` | Allouer, invoquer, transférer et libérer.                                          |
| `ConversationStore`                | Localiser, capturer et restaurer les transcriptions.                               |
| `ModelProvider`                    | Valider les réglages de modèle et échanger des messages bornés.                    |
| `Transport`                        | Lire, lister et modifier conditionnellement les objets binaires versionnés.        |
| `TaskQueue`                        | Persister les requêtes et protéger baux et résultats des workers.                  |

## Valider l’intégration

Testez les échecs observables, la propriété et le nettoyage. Des tests de protocole simulés n’établissent pas le comportement réel des montages, terminaux ou de l’isolation réseau. Les SDK optionnels appartiennent à leur point d’entrée d’intégration pour conserver un cœur léger.

Pour contribuer au dépôt, l’arborescence sépare contrats de domaine, orchestration applicative, adaptateurs, fournisseurs, infrastructure et CLI. Chaque agent intégré vit dans son propre dossier `src/adapters/agents/<agent>/`, avec un descripteur enregistré dans le catalogue des agents, dont dérivent `outpost init`, `outpost doctor`, le bootstrap distant et l’image générée. Suivez les consignes du dépôt et exécutez les contrôles pertinents pour la frontière modifiée.

API : [CliHarness](../../reference/cliharness/) · [AgentAdapter](../../reference/agentadapter/) · [SandboxProvider](../../reference/sandboxprovider/) · [ConversationStore](../../reference/conversationstore/) · [createTranscriptConversations](../../reference/createtranscriptconversations/) · [createSessionBundleConversations](../../reference/createsessionbundleconversations/).
