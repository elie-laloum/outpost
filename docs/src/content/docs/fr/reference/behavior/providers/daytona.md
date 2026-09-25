---
title: "Sandbox Daytona"
description: "Sandbox Daytona — Outpost"
sidebar:
  order: 5
---

Installez le SDK optionnel :

```sh
npm install @daytona/sdk
```

```ts
import { dispatch, claude } from "@elie-laloum/outpost";
import { daytona } from "@elie-laloum/outpost/providers/daytona";

const apiKey = process.env.DAYTONA_API_KEY;
if (!apiKey) throw new Error("Set DAYTONA_API_KEY");
await dispatch({
  agent: claude(),
  provider: daytona({
    connection: { apiKey },
    create: { language: "typescript" },
  }),
  branch: { mode: "named", name: "cloud/daytona-task" },
  brief: { text: "Relis le code et commite des corrections ciblées." },
});
```

`connection` configure le client SDK. `create` accepte les paramètres de création par image ou snapshot du SDK. Outpost accepte aussi `root`, `variables` et `retain`. Les identifiants du modèle se fournissent séparément via [l’environnement de l’agent](../../../../guide/agents/environment/).

L’environnement doit contenir Node.js, npm, Git, `sh` et `setsid`. L’installation automatique de l’agent est active sauf avec `bootstrap: false`. Une image personnalisée doit fournir les autres outils du projet.

Les sessions de processus natives transmettent stdout/stderr et sont nettoyées après l’appel. Les commandes non interactives conservent le shell de session Daytona pour lui permettre de remonter le statut de sortie du processus, y compris lorsque la commande ferme ses flux avant de terminer. Les sorties sont encodées pendant le transport puis décodées avant observation afin que les logs de session Daytona orientés lignes n’ajoutent pas d’octets aux chemins Git séparés par des octets nuls ni aux sorties sans fin de ligne. L’annulation termine le groupe de la commande, pas la sandbox entière. Le lease transfère fichiers et répertoires. Les commandes interactives et `sandbox.attach()` utilisent l’[API PTY native de Daytona](https://www.daytona.io/docs/en/pty/). Les flux préservent les octets ; stdout et stderr sont fusionnés dans la sortie du terminal. Outpost transmet les dimensions et événements de redimensionnement du flux de sortie, restaure le mode brut de l’entrée et déconnecte le PTY après exécution. Le statut de la commande est vérifié indépendamment de la fermeture WebSocket. L’annulation termine le groupe de processus et le PTY en conservant une sandbox réutilisable.

Lisez [la synchronisation distante](../../../../guide/environment/remote-sync/) avant d’activer `includeUncommitted` ou de modifier simultanément le workspace hôte. Les tests de contrat n’allouent pas de sandbox payante réelle.

[Exécutez les vérifications hébergées sur activation explicite](../../../../guide/extend/cloud-compatibility/) pour les contrats des fournisseurs réels et les CLI sans identifiants de modèle.

Exécutez le scénario de terminal natif avec un compte Daytona existant :

```sh
OUTPOST_DAYTONA_TERMINAL=1 node test/fixtures/daytona-terminal.ts
```

Il exige `DAYTONA_API_KEY`, alloue une sandbox facturable et tente toujours sa suppression. Il vérifie les vrais descripteurs TTY, l’entrée, le statut non nul après fermeture des sorties, le redimensionnement, l’annulation des descendants et la réutilisation. Il n’appelle aucun modèle. Les tests unitaires courants utilisent des doublures du contrat SDK ; leur réussite ne prouve pas la compatibilité cloud réelle.
