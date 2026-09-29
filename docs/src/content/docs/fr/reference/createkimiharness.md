---
title: "createKimiHarness"
description: "createKimiHarness — Outpost API"
sidebar:
  order: 0
---

## Import

```ts
import { createKimiHarness } from "@elie-laloum/outpost";
```

## Rôle et comportement

Crée le preset CLI Kimi Code sans lancer la CLI ; createAgent({ harness, model }) le lie et refuse reasoning et maxOutputTokens. Il capture et reprend des bundles de session, forke avec kimi fork et se pilote en arrêtant puis en reprenant le tour. L’usage de jetons est lu dans la session après la sortie.

[Exemple complet et règles détaillées](../../guide/kimi-code/).

## Paramètres et propriétés

| Nom                       | Type                                            | Présence  | Rôle                                                                                                                                                                                                                                                                                                                                   |
| ------------------------- | ----------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `settings`                | `KimiSettings \| undefined`                     | Optionnel | Réglages de Kimi Code ; model, reasoning et maxOutputTokens se placent sur createAgent() et sont refusés ici.                                                                                                                                                                                                                          |
| `settings.region`         | `"mainland-cn" \| "global" \| undefined`        | Optionnel | Déploiement du compte Kimi : "global" pour kimi.ai (par défaut) ou "mainland-cn" pour kimi.com, qui sélectionne le fichier OAuth et les endpoints de connexion. Le définir avec l’authentification usage échoue dès la création du harness.                                                                                            |
| `settings.authentication` | `AgentAuthentication \| undefined`              | Optionnel | "account" copie le fichier OAuth de la région et device_id depuis ~/.kimi-code (ou KIMI_CODE_HOME, ou le répertoire de profil account.file) puis exécute kimi login dans la sandbox. Les formes usage transmettent KIMI_API_KEY et exigent un modèle sur createAgent() ; account key et variable échouent à la composition de l’agent. |
| `settings.variables`      | `Readonly<Record<string, string>> \| undefined` | Optionnel | Variables d’environnement des commandes Kimi, fusionnées par-dessus .outpost/.env ; KIMI_CODE_NO_AUTO_UPDATE vaut 1 par défaut. Un nom également défini par le provider de sandbox échoue avec le code configuration.                                                                                                                  |
| `settings.conversations`  | `ConversationStore \| undefined`                | Optionnel | Store qui capture, localise et restaure les bundles de session Kimi au lieu du store natif par défaut, par exemple createTransportConversations(createKimiConversations(), …). Un store qui déclare un autre format est refusé dès la création du harness.                                                                             |
| `settings.mcpServers`     | `McpServers \| undefined`                       | Optionnel | Serveurs MCP fusionnés dans .kimi-code/mcp.json du home de l’agent, indexés par nom de serveur ; les autres serveurs du fichier sont conservés. Avec le fournisseur local, c’est votre propre home. Chaque variable référencée doit être déclarée.                                                                                     |

## Retour

`CliHarness`

## Signature

```ts
export declare function createKimiHarness(settings?: KimiSettings): CliHarness;
```

## Contrats associés

- [CliHarness](../cliharness/)
- [KimiSettings](../kimisettings/)
