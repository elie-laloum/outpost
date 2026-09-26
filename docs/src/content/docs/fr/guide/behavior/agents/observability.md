---
title: "Événements, logs et consommation"
description: "Événements, logs et consommation — Outpost"
sidebar:
  order: 11
---

Utilisez `reporter` pour une sortie terminal lisible ou `observe` pour une intégration structurée.

```ts
import {
  agent as composeAgent,
  dispatch,
  codexHarness,
  reporter,
} from "@elie-laloum/outpost";

const result = await dispatch({
  agent: composeAgent({ harness: codexHarness({}) }),
  brief: { text: "Examine et résume le dépôt." },
  label: "inspection",
  observe: reporter({ label: "inspection", verbose: false }),
  warn: console.warn,
  logging: { verbose: true },
});
console.log(result.usage, result.logReference);
```

## Événements

`AgentObservation` ajoute un numéro de `pass` à partir de 1 et une date ISO `at` aux événements normalisés. Les variantes sont `phase`, `prompt`, `text`, `text-delta`, `result`, `tool`, `tool-result`, `tool-denied`, `step`, `stop-prevented`, `compaction`, `conversation`, `usage`, `summary`, `warning`, `failure`, `finished` et `raw`. Les harness personnalisés émettent `step` avant chaque requête au modèle, `tool-result` avec un aperçu borné après chaque appel d’outil, `tool-denied` quand les permissions ou un hook refusent un appel `stop-prevented` quand un hook stop refuse la réponse et `compaction` quand une stratégie de contexte réécrit l’historique ; leurs événements `tool` portent un `callId`. Vérifiez le discriminant avant de lire les champs propres à une variante. Le protocole inconnu reste disponible dans `raw`.

Les erreurs des callbacks d’observation et d’avertissement ne font pas échouer la tâche. N’utilisez pas un observateur pour imposer une règle métier essentielle : validez le résultat retourné. `reporter` accepte `label`, `verbose`, `quiet` et une fonction `write(text)` personnalisée.

## Journalisation

Les journaux utilisent des segments immuables et un index versionné via `Transport`. Par défaut : `localTransport({ directory: resolve(repository, ".outpost/storage") })`. Utilisez `logging: false` pour désactiver la persistance, `"stdout"` pour le terminal ou `{ transporter, verbose }` pour choisir le stockage. Le mode verbose inclut les événements bruts et les fragments `text-delta`.

Chaque dispatch possède son propre journal, même avec un transport partagé. Lisez `result.logReference` avec `readJournal({ transporter, reference: result.logReference })`. La fermeture est idempotente et marque conditionnellement l’index comme fermé pour la rétention ; il n’y a ni fichier annexe JSONL ni option d’ajout à un fichier.

## Comptage des tokens

`Usage` contient `input`, `cached` (lecture du cache), `cacheCreated` facultatif (création du cache) et `output`. Chaque tour fournit `durationMs` et sa consommation ; le résultat les cumule. La consommation du transcript Claude utilise le dernier message assistant, indépendamment des totaux du flux. Il s’agit de comptages bruts, pas d’une estimation de coût.

Les logs et transcripts peuvent contenir sources et prompts privés. Gérez leur conservation séparément du nettoyage des workspaces ; capture native et journalisation sont indépendantes.

Les [budgets](../../../workflows/budgets/) et [OpenTelemetry](../../../advanced/telemetry/) décrivent les limites de consommation et les métriques respectant la confidentialité.

Voir les [politiques de rétention et quotas](../../../operations/storage-retention/) pour le nettoyage explicite des journaux fermés.

## Handlers personnalisés

`createReporter(handlers, { onError })` retourne un observateur appelable avec `flush()`. Chaque handler reçoit son `AgentObservation` précis, avec `pass` et `at`. Les handlers s’exécutent séquentiellement, acceptent les promesses et ignorent les types absents. Attendez toujours `flush()` avant de fermer les destinations ; le dispatch n’attend pas les handlers. La première erreur est conservée et rejetée par chaque flush ; les handlers suivants continuent. Voir l’[exemple Winston, console et fichier](../../../agents/observability/#créer-son-propre-reporter). Les callbacks observe ordinaires restent synchrones et leurs promesses retournées ne sont pas gérées.
