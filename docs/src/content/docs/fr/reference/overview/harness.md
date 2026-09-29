---
title: "Harness — Vue d’ensemble"
description: "Un harness définit comment un agent exécute une tâche et accède à son modèle."
sidebar:
  label: Vue d’ensemble
  order: 0
---

Un harness définit comment un agent exécute une tâche et accède à son modèle. Les presets CLI et le moteur d’Outpost se composent avec un modèle via `createAgent({ harness, model })`. Cette famille regroupe leurs fonctions de création, les définitions d’outils et d’instructions, les contrats d’exécution, les réglages et les adaptateurs de protocole CLI.

## Fonctionnement

Choisissez `createClaudeHarness()`, `createCodexHarness()`, `createAntigravityHarness()`, `createCopilotHarness()` ou `createKimiHarness()` pour déléguer l’exécution à la CLI correspondante. Leurs réglages configurent l’exécution, l’authentification explicite et les conversations prises en charge. `authentication` reçoit une [`AgentAuthentication`](../../agentauthentication/) : `"account"` réutilise la connexion propre à la CLI, éventuellement via un [`AccountCredential`](../../accountcredential/) (`file`, `key` ou `variable`), tandis que `"usage"` facture une clé API, éventuellement via un [`UsageCredential`](../../usagecredential/) (`key` ou `variable`). Chaque preset n’accepte que les formes prises en charge par sa CLI et refuse les autres à la composition de l’agent. Sans `authentication`, Outpost ne prépare aucun identifiant.

Utilisez `createHarness()` pour qu’Outpost pilote lui-même le modèle. Il combine un [fournisseur de modèles](../model-providers/), des outils issus de `defineHarnessTool()` et `defineHarnessToolset()`, des instructions en texte ou via `defineHarnessInstructions()`, des hooks, des permissions, des limites de boucle et des réglages d’exécution des outils. Sélectionnez le modèle sur l’[agent](../agents/) ; un harness personnalisé exige un modèle explicite, tandis qu’un preset CLI peut conserver son modèle natif par défaut.

Les deux variantes acceptent `mcpServers`, une table [`McpServers`](../../mcpservers/) de serveurs stdio ([`McpStdioServer`](../../mcpstdioserver/)) ou HTTP ([`McpHttpServer`](../../mcphttpserver/)). Les presets CLI la traduisent dans leur configuration native, planifiée par `AgentAdapter.configuration` sous forme de fichiers [`AgentConfiguration`](../../agentconfiguration/) lorsqu’une CLI la lit dans son home ; le moteur Outpost démarre les serveurs dans la sandbox à chaque tour et expose leurs outils sous la forme `mcp__<serveur>__<outil>`, ainsi que des outils de ressources et de prompts. [`McpToolFilter`](../../mcptoolfilter/) sélectionne les outils, [`McpClientCredentials`](../../mcpclientcredentials/) authentifie les serveurs HTTP du moteur, et [`defineMcpPrompt`](../../definemcpprompt/) rend un prompt de serveur dans les instructions via [`HarnessMcpContext`](../../harnessmcpcontext/).

Le moteur intégré renvoie un [`Harness`](../../type-customharness/) configuré avec [`HarnessOptions`](../../customharnessoptions/). [`AgentHarness`](../../harness/) est l’union `CliHarness | Harness` pour le code qui accepte les deux variantes d’exécution.

## Frontières et responsabilités

Construire un harness ne lance ni processus, ni connexion, ni requête réseau ; les fichiers d’identifiants de l’hôte ne sont lus qu’à la préparation d’une sandbox, et Outpost ne lit jamais un trousseau système. Une CLI possède sa boucle interne modèle/outils. Claude Code et Codex prennent en charge capture, reprise et fork natifs ; Kimi prend aussi en charge capture, reprise et fork ; Copilot prend en charge capture et reprise ; Antigravity reprend uniquement dans la même sandbox ouverte. Leurs modèles restent des noms sans `reasoning` ni `maxOutputTokens`.

Le moteur d’Outpost tourne dans le processus Outpost. Chaque étape est une requête au modèle ; les outils passent par le sandbox emprunté, et les limites font échouer la passe avec le code `limit` au lieu de réussir. Les passes sont enregistrées dans des transcriptions qui permettent continuation, fork et réparations de réponse, et des stratégies de contexte peuvent compacter les longs historiques. Le terminal interactif n’est pas pris en charge. `AgentAdapter` et `AgentInput` décrivent la construction des commandes CLI et le décodage des événements. L’allocation du sandbox relève de [Providers](../providers/).

Les presets CLI sont stables depuis la version 5.0.0. Le moteur intégré et ses définitions sont stables en 7.0.0. `defineHarnessSubagent()` expose un enfant intégré comme outil sérialisé avec son historique et ses limites ; il emprunte la sandbox et ses tokens comptent aussi dans les budgets ancêtres.

## Points d’entrée

- [createHarness](../../createharness/) compose le moteur d’Outpost.
- [defineHarnessTool](../../defineharnesstool/), [defineHarnessToolset](../../defineharnesstoolset/) et [defineHarnessInstructions](../../defineharnessinstructions/) déclarent ce que le moteur peut utiliser.
- [createHarnessFileTools](../../createharnessfiletools/), [createHarnessEditTools](../../createharnessedittools/), [createHarnessSearchTools](../../createharnesssearchtools/), [createHarnessGitTools](../../createharnessgittools/) et [createHarnessShellTools](../../createharnessshelltools/) fournissent des outils de dépôt.
- [defineHarnessContextStrategy](../../defineharnesscontextstrategy/), [truncateToolResults](../../truncatetoolresults/) et [summarizeHistory](../../summarizehistory/) maintiennent les longs historiques dans le contexte du modèle.
- [defineHarnessSkill](../../defineharnessskill/) regroupe des instructions et des outils que le modèle charge à la demande.
- [defineHarnessHook](../../defineharnesshook/) et [defineHarnessPermissions](../../defineharnesspermissions/) contrôlent les appels d’outils et la fin de la boucle.
- [createClaudeHarness](../../createclaudeharness/), [createCodexHarness](../../createcodexharness/), [createAntigravityHarness](../../createantigravityharness/), [createCopilotHarness](../../createcopilotharness/) et [createKimiHarness](../../createkimiharness/) configurent les presets CLI avec [ClaudeSettings](../../claudesettings/), [CodexSettings](../../codexsettings/), [AntigravitySettings](../../antigravitysettings/), [CopilotSettings](../../copilotsettings/) et [KimiSettings](../../kimisettings/).
- [AgentAuthentication](../../agentauthentication/), [AccountCredential](../../accountcredential/) et [UsageCredential](../../usagecredential/) choisissent comment un preset CLI s’authentifie.
- [McpServers](../../mcpservers/), [McpServer](../../mcpserver/), [McpStdioServer](../../mcpstdioserver/) et [McpHttpServer](../../mcphttpserver/) déclarent des serveurs MCP pour les deux variantes ; voir [Serveurs MCP](../../../guide/mcp-servers/).
- [agentVersions](../../agentversions/) liste les versions de CLI épinglées pour les images générées et le bootstrap distant, y compris les archives Antigravity vérifiées avec des empreintes SHA-512 épinglées.
- [Harness](../../harness/) est le contrat commun de composition.
- [HarnessToolContext](../../harnesstoolcontext/) décrit le sandbox, le signal d’annulation, le modèle et l’observateur accessibles à un outil.
- [AgentAdapter](../../agentadapter/) décrit l’adaptateur de protocole CLI.
- [AgentConfiguration](../../agentconfiguration/) et [ConfigurationFile](../../configurationfile/) décrivent la configuration CLI fusionnée dans le home de l’agent.

[Apprendre avec le guide pratique](../../../guide/agents/harness/). Pour les presets CLI, consultez [le guide des adapters](../../../guide/agents/adapters/) et [l’authentification](../../../guide/manual/authentication/).
