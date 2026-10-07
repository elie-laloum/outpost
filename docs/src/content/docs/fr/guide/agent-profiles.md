---
title: "Réutiliser une configuration d’agent"
description: "Partager les instructions littérales, restrictions d’outils intégrés et serveurs MCP entre harness."
---

## Déclarer le profil une fois

Utilisez `defineAgentProfile()` pour conserver les instructions et serveurs MCP de votre équipe indépendamment du CLI choisi. La déclaration est validée et copiée dans un objet figé ; elle ne démarre aucun processus et ne lit aucun identifiant. Suivez [l’installation](../setup/) avant d’exécuter un agent CLI.

Enregistrez cette déclaration dans `profile.ts`. Le serveur MCP est un programme du dépôt, exécuté dans la sandbox. Son token est référencé par nom de variable ; fournissez sa valeur dans [l’environnement de la sandbox](../environment-variables/).

```ts title="profile.ts"
import { defineAgentProfile } from "@elie-laloum/outpost";

export const profile = defineAgentProfile({
  instructions: "Never modify generated files.",
  mcpServers: {
    docs: {
      command: "node",
      arguments: ["mcp/docs.mjs"],
      variables: ["DOCS_TOKEN"],
      tools: { exclude: ["delete_note"] },
    },
  },
});
```

## Choisir l’agent séparément

Enregistrez `agent.ts` à côté du profil. L’authentification reste sur le harness ; le profil ne contient ni identifiants ni réglages du modèle. Les deux agents suivants réutilisent les mêmes instructions et la même déclaration MCP. Passez l’un ou l’autre à [dispatch](../first-request/), avec le même dépôt et le même fournisseur de sandbox.

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

Claude reçoit des instructions système ajoutées et du JSON MCP natif. Codex reçoit `developer_instructions` et les valeurs TOML MCP par surcharge de configuration, y compris en mode app-server. Copilot, Kimi et Antigravity placent les instructions comme texte littéral avant chaque demande, y compris les réparations et reprises. Le contrat de réponse finale reste après le texte de la demande. Ces projections n’écrivent pas les instructions partagées dans le dépôt et ne changent pas les fichiers d’authentification hôte. Les fichiers MCP natifs du répertoire personnel conservent [leur comportement de fusion existant](../mcp-servers/).

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

Appliquez `restricted` à `createClaudeHarness()` ou `createHarness()`. Claude traduit la restriction dans sa sélection d’outils intégrés et un hook `PreToolUse`, utilise `dontAsk` et désactive les sources de réglages utilisateur/projet/local et les configurations MCP héritées pour cette demande. Le hook contrôle la commande shell entière : `npm test --watch`, les wrappers, les espaces supplémentaires et `npm test && git push` sont refusés. Un mode de permission Claude explicite incompatible échoue à la composition de l’agent. Le hook de commande exige Node.js dans la sandbox et une installation CLI capable d’exécuter sa commande shell.

Le harness Outpost intégré associe la lecture à `read_file`, `list_files` et `search`, l’édition à `write_file` et `edit_file` et le shell à `shell`. Déclarez les [jeux d’outils](../harness-tools/) correspondants sur le harness ; le profil fournit une politique, pas des implémentations. Les autres outils personnalisés, Git et de délégation sont refusés lorsqu’une liste est présente. Les permissions du profil se cumulent avec les [permissions du harness](../harness-permissions/), sont réévaluées après les hooks qui changent les entrées et restent actives dans les sous-agents descendants. Chaque sous-agent peut imposer ses propres restrictions de profil.

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
