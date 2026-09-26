---
title: "Choisir des capacités compatibles"
description: "Les capacités des agents et providers sont indépendantes."
---

| Agent                                   | Nouvelle exécution | Capture, reprise et fork natifs | Réparation de réponse | Formes d’authentification           | Dans l’image générée |
| --------------------------------------- | ------------------ | ------------------------------- | --------------------- | ----------------------------------- | -------------------- |
| Claude Code                             | Oui                | Oui                             | Oui                   | `account` (fichier, jeton), `usage` | Oui                  |
| Codex                                   | Oui                | Oui                             | Oui                   | `account` (fichier), `usage`        | Oui                  |
| Antigravity CLI (`agy`)                 | Oui                | Non                             | Non                   | `account` (fichier), `usage`        | Oui, non épinglé     |
| GitHub Copilot CLI                      | Oui                | Non                             | Non                   | `account` (fichier, jeton)          | Oui                  |
| Kimi Code                               | Oui                | Non                             | Non                   | `account` (profil), `usage`         | Oui                  |
| `harness()` personnalisé (expérimental) | Oui                | Oui, transcript Outpost         | Oui                   | Clé API du model provider           | Sans objet           |

| Provider        | Environnement                  | Terminal interactif           | Mode Git                      |
| --------------- | ------------------------------ | ----------------------------- | ----------------------------- |
| Docker / Podman | Conteneur local                | Oui                           | Current, named, integrate     |
| Local           | Processus hôte, sans isolation | Oui                           | Current, named, integrate     |
| Vercel          | Sandbox distante               | Non                           | Named, integrate              |
| Daytona         | Sandbox distante               | Oui, PTY natif                | Named, integrate              |
| Firecracker     | MicroVM de recherche           | Voir les limites du prototype | Voir les limites du prototype |

[Choisissez un provider](../../environment/providers/overview/) ou consultez ses [limites exactes](../../behavior/providers/overview/). Les endpoints Codex personnalisés exigent la compatibilité Responses API. Antigravity, Copilot et Kimi n’exécutent que de nouvelles sessions ; ils n’héritent pas de la gestion des conversations Claude/Codex. Voir [l’authentification](../authentication/) pour chaque forme et [les harness des CLI d’agents](../../behavior/agents/adapters/) pour les options de chaque CLI. Isolation opt-in, egress et exécution spéculative ont des limites de recherche explicites.
