---
title: "Choisir des capacités compatibles"
description: "Les capacités des agents et providers sont indépendantes."
---

| Agent       | Nouvelle exécution | Capture, reprise et fork natifs | Réparation de réponse |
| ----------- | ------------------ | ------------------------------- | --------------------- |
| Claude Code | Oui                | Oui                             | Oui                   |
| Codex       | Oui                | Oui                             | Oui                   |
| Gemini CLI  | Oui                | Non                             | Non                   |

| Provider        | Environnement                  | Terminal interactif           | Mode Git                      |
| --------------- | ------------------------------ | ----------------------------- | ----------------------------- |
| Docker / Podman | Conteneur local                | Oui                           | Current, named, integrate     |
| Local           | Processus hôte, sans isolation | Oui                           | Current, named, integrate     |
| Vercel          | Sandbox distante               | Non                           | Named, integrate              |
| Daytona         | Sandbox distante               | Oui, PTY natif                | Named, integrate              |
| Firecracker     | MicroVM de recherche           | Voir les limites du prototype | Voir les limites du prototype |

[Choisissez un provider](../../../guide/environment/providers/overview/) ou consultez ses [limites exactes](../../behavior/providers/overview/). Les endpoints Codex personnalisés exigent la compatibilité Responses API. Gemini n’hérite pas de la gestion des conversations Claude/Codex. Isolation opt-in, egress et exécution spéculative ont des limites de recherche explicites.
