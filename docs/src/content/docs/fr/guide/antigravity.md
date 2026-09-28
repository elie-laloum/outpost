---
title: "Antigravity"
description: "Connecter Antigravity à une sandbox Outpost."
---

Utilisez `antigravityHarness()` avec un [environnement d’exécution](../execution-backends/) pris en charge. Installez la CLI dans votre image ou autorisez le bootstrap chez les fournisseurs distants.

## Accès par compte

Lancez `agy` sur l’hôte et connectez-vous. Outpost copie `~/.gemini/antigravity-cli/antigravity-oauth-token` dans le home privé de la sandbox. L’exécutable est `agy`, pas l’ancienne CLI Gemini.

## Accès API

Fournissez explicitement `GEMINI_API_KEY`. L’usage API suit la facturation API du fournisseur.

```ts
import { agent, antigravityHarness } from "@elie-laloum/outpost";

const coder = agent({
  harness: antigravityHarness({
    authentication: "usage",
    variables: { GEMINI_API_KEY: process.env.GEMINI_API_KEY ?? "" },
  }),
});
```

## Comportement

Reprenez une conversation émise dans la même sandbox ouverte avec `sandbox.resume(id, options)` ou `resume()` sur un résultat à chaud. Les réparations automatiques de réponse réutilisent cette conversation. Outpost ne dispose pas de format de capture portable vérifié pour Antigravity : la reprise à froid après fermeture de la sandbox et le fork automatisé sont refusés. Un dispatch sans continuation démarre toujours une session neuve. Voir [l’historique](../chat-history/) et [la commande de reprise Google](https://www.antigravity.google/docs/cli/commands/resume/).

## Installation épinglée

Les images générées et le bootstrap distant installent la version de [`agentVersions.antigravity`](../../reference/agentversions/) depuis des archives Google versionnées, dont les empreintes SHA-512 enregistrées dans Outpost sont vérifiées avant extraction. Les distributions Linux amd64/arm64 couvrent glibc et musl ; l’installateur reconnaît aussi macOS Intel/Apple Silicon. Une plateforme non prise en charge ou une empreinte incorrecte provoque un échec explicite. Les fichiers temporaires sont nettoyés après réussite, échec ou interruption interceptée.

Outpost définit `AGY_CLI_DISABLE_AUTO_UPDATE=true` dans les images générées, les requêtes Antigravity et les commandes de diagnostic, conformément aux [instructions de Google](https://antigravity.google/docs/cli/troubleshooting/). Cela empêche les mises à jour en arrière-plan pendant ces invocations.

Le bootstrap réutilise un exécutable existant sans le remplacer ni vérifier ses octets. Lancez `outpost doctor --agent antigravity --sandbox-provider local` pour l’hôte, ou ajoutez `--sandbox-provider docker --image votre-image` pour inspecter une image. Doctor affiche les versions installée et de référence et avertit si elles diffèrent ; il ne vérifie pas l’empreinte du binaire installé. Les images et recettes existantes doivent être régénérées ou modifiées puis reconstruites pour adopter cette installation. Ces contrôles ne prouvent pas la compatibilité des exécutions authentifiées de modèles.

API : [antigravityHarness](../../reference/antigravityharness/).
