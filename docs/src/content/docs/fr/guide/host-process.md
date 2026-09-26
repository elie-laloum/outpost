---
title: "Processus hôte"
description: "Exécuter volontairement sans isolation de sandbox."
---

`localSandboxProvider()` exécute directement sur l’hôte. Utilisez-le pour du code fiable lorsque vous voulez volontairement accéder aux outils et au système de fichiers de l’hôte.

```ts
import { localSandboxProvider } from "@elie-laloum/outpost/providers/local";

const sandboxProvider = localSandboxProvider();
```

Installez vous-même la CLI de l’agent et les dépendances du projet. Ce fournisseur ne crée pas d’isolation par conteneur et ne protège pas les identifiants de l’hôte du code exécuté.

L’authentification par compte utilise la session hôte existante de la CLI. Outpost transmet les variables d’identification mais n’installe pas de fichiers d’identifiants sur l’hôte.

Les politiques de branches et l’orchestration des workflows restent applicables. Choisissez [Docker](../docker/) ou [Podman](../podman/) pour exécuter dans un conteneur.

API : [localSandboxProvider](../../reference/localsandboxprovider/).
