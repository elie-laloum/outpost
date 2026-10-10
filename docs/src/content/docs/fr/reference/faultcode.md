---
title: "FaultCode"
description: "FaultCode — Outpost API"
sidebar:
  order: 10
---

## Import

```ts
import type { FaultCode } from "@elie-laloum/outpost";
```

## Rôle et comportement

Code stable de chaque OutpostError ; testez-le plutôt que message.

- "rejected" (gate de workflow refusée par un acteur autorisé)

- "configuration" (options invalides, variables en conflit, fichier d’identifiants absent ou mal formé, réservation de stockage refusée)

- "process" (l’agent ou la commande se termine avec un statut non nul ou sans événement final)

- "timeout" (délai d’inactivité, échéance, limite de temps d’une commande, d’un outil, d’un transfert, du démarrage MCP, d’une requête modèle ou d’un workflow dépassés)

- "aborted" (sandbox fermée, commande annulée, tour de harness ou appel d’outil terminé, requête modèle interrompue)

- "workspace" (chemin ou lien symbolique dangereux, admission refusée par le quota de recovery, échec de la synchronisation distante ou de la restauration d’un recovery)

- "conflict" (worktree verrouillé, branche extraite ailleurs, modifications de l’hôte pendant la synchronisation, échec de l’intégration automatique)

- "prompt" (variable de prompt manquante ou échec d’une commande de prompt)

- "response" (réponse typée absente ou invalide, réponse modèle ou MCP invalide, refus du modèle)

- "session" (conversation ou transcript absent ou illisible)

- "provider" (échec d’une opération du provider de sandbox, erreur HTTP du modèle autre que 429, erreur du flux modèle)

- "limit" (maxSteps, maxToolCalls, maxOutputTokens, budget de tokens ou profondeur de délégation du harness atteints)

- "quota" (l’agent ou le modèle signale une limite d’usage ou de débit définitive)

- "replay" (un agent de rejeu diverge de son journal)

- "steering" (consigne non remise avant la fin du dispatch ou la fermeture du contrôleur). La valeur "guard" indique qu’une politique de diff commité du workspace a refusé des changements, que des références ont changé pendant l’inspection ou que celle-ci n’a pas pu aboutir. La valeur "stuck" indique que le watchdog d’activité optionnel a arrêté les actions répétitives de l’agent.

[Exemple complet et règles détaillées](../../guide/error-handling/).

## Signature

```ts
export type FaultCode =
  | "stuck"
  | "guard"
  | "rejected"
  | "configuration"
  | "process"
  | "timeout"
  | "aborted"
  | "workspace"
  | "conflict"
  | "prompt"
  | "response"
  | "session"
  | "provider"
  | "limit"
  | "quota"
  | "replay"
  | "steering";
```
