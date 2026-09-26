---
title: "Intégrations personnalisées"
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

## Ajouter un harness CLI

Un `CliHarness` expose `kind: "cli"` et `bind(model)`, qui renvoie un `AgentAdapter`. Composez-le avec `agent({ harness })`. Séparez construction des requêtes et décodage des événements, déclarez honnêtement les capacités de continuation et fournissez un store uniquement si la restauration fonctionne.

## Ajouter un fournisseur de sandbox

Renvoyez un bail avec `root`, `home`, invocation, upload/download et libération idempotente. Préservez le statut de sortie après fermeture des flux, l’annulation des processus et les transferts binaires. `mountedSandboxProvider()` et `remoteSandboxProvider()` aident à composer les stratégies correspondantes.

## Valider l’intégration

Testez les échecs observables, la propriété et le nettoyage. Des tests de protocole simulés n’établissent pas le comportement réel des montages, terminaux ou de l’isolation réseau. Les SDK optionnels appartiennent à leur point d’entrée d’intégration pour conserver un cœur léger.

Pour contribuer au dépôt, l’arborescence sépare contrats de domaine, orchestration applicative, adaptateurs, fournisseurs, infrastructure et CLI. Suivez les consignes du dépôt et exécutez les contrôles pertinents pour la frontière modifiée.

API : [CliHarness](../../reference/cliharness/) · [AgentAdapter](../../reference/agentadapter/) · [SandboxProvider](../../reference/sandboxprovider/) · [ConversationStore](../../reference/conversationstore/).
