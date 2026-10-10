---
title: "Réutiliser une configuration d’agent"
description: "Partager les instructions littérales, restrictions d’outils intégrés et serveurs MCP entre harness."
---

Après avoir [lancé un agent](../first-request/), extrayez les consignes et serveurs MCP à partager. Le modèle et l’authentification restent propres à chaque harness. Un profil est une configuration réutilisable, pas une frontière d’isolation.

## Déclarer le profil une fois

Utilisez `defineAgentProfile()` pour conserver les instructions et serveurs MCP de votre équipe indépendamment du CLI choisi. La déclaration est validée et copiée dans un objet figé ; elle ne démarre aucun processus et ne lit aucun identifiant. Suivez [l’installation](../setup/) avant d’exécuter un agent CLI.

Enregistrez les instructions dans `profile.ts`. Ce premier profil ne nécessite aucun serveur MCP.

```ts title="profile.ts"
import { defineAgentProfile } from "@elie-laloum/outpost";

export const profile = defineAgentProfile({
  instructions: "Never modify generated files.",
});
```

## Choisir l’agent séparément

Enregistrez `agent.ts` à côté du profil. L’authentification reste sur le harness ; le profil ne contient ni identifiants ni réglages du modèle. Les deux agents suivants réutilisent les mêmes instructions. Passez l’un ou l’autre à [dispatch](../first-request/), avec le même dépôt et le même fournisseur de sandbox.

```ts title="agent.ts"
import {
  createAgent,
  createClaudeHarness,
  createCodexHarness,
} from "@elie-laloum/outpost";
import { profile } from "./profile.ts";

export const claude = createAgent({
  harness: createClaudeHarness({ authentication: "account", profile }),
});
export const codex = createAgent({
  harness: createCodexHarness({ authentication: "account", profile }),
});
```

Le harness applique les instructions à chaque demande, y compris les corrections et reprises, sans les écrire dans votre dépôt ni modifier les identifiants de l’hôte. [defineAgentProfile](../../reference/defineagentprofile/) détaille leur traduction pour chaque CLI ; la [configuration MCP](../mcp-servers/) explique la fusion des réglages.

## Restreindre les outils intégrés

Enregistrez `restricted-profile.ts` à côté du premier fichier. Ce profil autorise la lecture et l’édition de fichiers et uniquement la commande shell exacte `npm test`. L’absence de restriction conserve le comportement du harness ; une liste vide n’autorise aucun outil intégré. Les déclarations explicites de serveurs MCP accordent leurs propres outils, restreints séparément par les filtres de chaque serveur.

```ts title="restricted-profile.ts"
import { defineAgentProfile } from "@elie-laloum/outpost";
import { profile } from "./profile.ts";

export const restricted = defineAgentProfile({
  instructions: profile.instructions!,
  mcpServers: profile.mcpServers!,
  allowedTools: ["read", "edit", "shell:npm test"],
});
```

Appliquez `restricted` à `createClaudeHarness()` ou `createHarness()`. Claude applique la liste via sa sélection d’outils et un hook de commande, désactive les réglages et configurations MCP hérités pour cette demande, et refuse les modes de permission incompatibles. Le hook exige Node.js et une CLI capable de l’exécuter dans la sandbox.

Une autorisation shell porte sur la commande entière : `npm test --watch`, les espaces supplémentaires, les wrappers et `npm test && git push` ne correspondent pas à `shell:npm test`.

Dans le harness intégré, déclarez les [jeux d’outils](../harness-tools/) en plus du profil : une politique n’installe pas d’outils. `read` couvre `read_file`, `list_files` et `search` ; `edit` couvre `write_file` et `edit_file` ; `shell` couvre `shell`. Les autres outils personnalisés, Git et de délégation sont refusés lorsqu’une liste est présente.

Les restrictions du profil se cumulent avec les [permissions du harness](../harness-permissions/) et sont revérifiées après modification des paramètres par un hook. Les sous-agents les héritent et peuvent ajouter leurs propres restrictions.

Les instructions guident le comportement. Les restrictions d’outils contrôlent les appels via le protocole de l’agent choisi ; elles ne constituent pas une frontière de sécurité du système de fichiers ou du réseau. Une commande shell ou un outil MCP autorisé peut avoir des effets plus larges. La politique administrée de Claude et sa configuration CLI de confiance restent applicables. Voir [la sécurité](../security/).

## Traiter les projections non prises en charge

Outpost refuse une projection qu’il ne sait pas appliquer ; il ne la remplace jamais par une instruction demandant au modèle de respecter une restriction d’outils. Le refus porte le code `configuration` et nomme la fonctionnalité non prise en charge.

| Harness     | Instructions                                     | Liste d’outils intégrés autorisés    | MCP                           |
| ----------- | ------------------------------------------------ | ------------------------------------ | ----------------------------- |
| Outpost     | Instructions système avant les ajouts du harness | Contrôlée par la boucle Outpost      | Pont existant dans la sandbox |
| Claude Code | Ajout au prompt système natif                    | Sélection native et hook de commande | Projection native existante   |
| Codex       | Instructions développeur natives                 | Refusée, même vide                   | Projection native existante   |
| Copilot CLI | Préfixe littéral de la demande                   | Refusée, même vide                   | Projection native existante   |
| Kimi Code   | Préfixe littéral de la demande                   | Refusée, même vide                   | Projection native existante   |
| Antigravity | Préfixe littéral de la demande                   | Refusée, même vide                   | Projection native existante   |

Les listes d’outils autorisés pour Codex, Copilot, Kimi et Antigravity échouent à `createAgent()`, avant toute allocation de sandbox. Kimi refuse aussi les instructions du profil lors de la construction d’une demande interactive, car son mode interactif n’accepte aucun prompt initial. Les autres CLI transmettent le profil aux demandes interactives par leurs arguments natifs ou leur prompt initial.

Les déclarations MCP du profil et du harness sont fusionnées par nom de serveur. Un nom en double est refusé à la création du harness, même lorsque les déclarations sont identiques. Les restrictions existantes des adapters restent applicables : Claude refuse par exemple un filtre MCP `tools.include`, et le harness intégré refuse les logins OAuth des CLI. Voir [les serveurs MCP](../mcp-servers/) et [OAuth MCP](../mcp-oauth/) pour les projections prises en charge.

## Exécuter l’exemple hors ligne

Le dépôt contient [`examples/58-agent-profiles`](https://gitlab.elielaloum.com/elielaloum/outpost/-/tree/main/examples/58-agent-profiles). Compilez Outpost, puis exécutez `node examples/58-agent-profiles/index.ts`. L’exemple réutilise un profil pour les projections des demandes CLI et exécute un modèle simulé avec le harness intégré, des outils de fichiers locaux réels et un serveur MCP local. Il vérifie qu’une édition interdite est refusée sans créer le fichier. Le fournisseur local explicitement non isolé ne nécessite ni identifiants ni conteneur.

Les tests déterministes couvrent la projection des demandes, le hook de commande réel, le refus d’outils locaux, les hooks et la continuation dans une sandbox réutilisée. Les exécutions payantes de CLI/modèles et les continuations natives avec profils restent à valider contre les versions épinglées. La projection Claude suit sa [référence CLI](https://code.claude.com/docs/en/cli-reference) et [ses permissions](https://code.claude.com/docs/en/permissions) ; les surcharges Codex suivent sa [référence de configuration](https://developers.openai.com/codex/config-reference/).

API : [defineAgentProfile](../../reference/defineagentprofile/) · [AgentProfile](../../reference/agentprofile/) · [AgentProfileOptions](../../reference/agentprofileoptions/) · [AgentProfileTool](../../reference/agentprofiletool/).
