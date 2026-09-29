---
title: Outpost
description: "Exécutez un agent, maîtrisez son environnement, composez un workflow."
landing:
  headline:
    - "Exécutez un agent,"
    - "maîtrisez son environnement,"
    - "composez un workflow."
  lead: "Outpost est une bibliothèque TypeScript et une CLI pour exécuter des agents de code dans les sandboxes de votre choix, sur des workspaces Git que vous contrôlez, sous forme de workflows typés qui résistent aux interruptions."
  install:
    command: "npx @elie-laloum/outpost init"
    copy: "Copier la commande d’installation"
    copied: "Copié"
  primary: { label: "Commencer", href: "guide/setup/" }
  secondary: { label: "Lire le guide", href: "guide/introduction/" }
  facts: "Node.js 24+ · MIT"
  reference: { label: "Référence de l’API", href: "reference/" }
  window:
    label: "Fichiers d’un projet d’exemple"
    copy: "Copier ce fichier"
    example: "exemple"
    notes:
      run: 'node run.ts "Fix the failing tests, verify and commit."'
      brief: "{{OBJECTIVE}} vient de la ligne de commande ; Outpost renseigne les noms de branche."
      workflow: "Deux revues en parallèle, chacune dans sa propre sandbox Podman."
  run:
    title: "Exécutez un agent"
    text: "Claude Code, Codex, Copilot CLI, Kimi Code, Antigravity ou le harness intégré d’Outpost, sur Docker, Podman, Vercel, Daytona ou votre machine. Changer l’un ou l’autre tient en une ligne ; le dispatch reste identique."
    caption: "Changer d’agent et de sandbox"
    link:
      { label: "Choisir un environnement", href: "guide/execution-backends/" }
  own:
    title: "Maîtrisez son environnement"
    text: "Rien n’est implicite. Vous choisissez comment chaque agent s’authentifie, où il s’exécute et comment sa branche est intégrée."
    ledger:
      - {
          term: "Identifiants",
          detail: "Votre connexion de compte ou une clé d’API, déclarée par harness. Jamais de trousseau système.",
        }
      - {
          term: "Sandbox",
          detail: "Votre fournisseur. Une sandbox isolée ne se replie jamais sur l’hôte.",
        }
      - {
          term: "Branche",
          detail: "Le checkout courant, une branche nommée ou intégrée : votre choix à chaque dispatch.",
        }
      - {
          term: "Récupération",
          detail: "Conservée dès qu’un nettoyage perdrait du travail.",
        }
    link:
      { label: "Identifiants et limites", href: "guide/access-credentials/" }
  compose:
    title: "Composez un workflow"
    text: "Les tâches se transmettent des résultats typés. Les exécutions posent des checkpoints, attendent des validations, se mettent en pause sur quota et reprennent la conversation là où elle s’était arrêtée."
    primitives:
      - {
          name: "defineWorkflow",
          href: "reference/defineworkflow/",
          detail: "Valide le graphe de tâches",
        }
      - {
          name: "defineIsolatedTask",
          href: "reference/defineisolatedtask/",
          detail: "Un agent avec sa propre sandbox",
        }
      - {
          name: "defineApprovalTask",
          href: "reference/defineapprovaltask/",
          detail: "Attend une décision humaine",
        }
      - {
          name: "defineLoopTask",
          href: "reference/definelooptask/",
          detail: "Réessaie avec le retour d’une vérification",
        }
    link: { label: "Relier les tâches", href: "guide/task-dependencies/" }
  runtimes:
    title: "Agents et sandboxes"
    text: "Chaque agent pris en charge s’exécute dans chaque sandbox. La gestion des conversations varie selon l’agent : chacun est présenté avec ce qu’il sait faire."
    agentsLabel: "Agents"
    sandboxesLabel: "Sandboxes"
    experimental: "Expérimental"
    agents:
      - {
          name: "Claude Code",
          href: "guide/claude-code/",
          note: "capture · reprise · fork",
        }
      - {
          name: "Codex",
          href: "guide/codex/",
          note: "capture · reprise · fork",
        }
      - {
          name: "Kimi Code",
          href: "guide/kimi-code/",
          note: "capture · reprise · fork",
        }
      - {
          name: "Copilot CLI",
          href: "guide/copilot-cli/",
          note: "capture · reprise",
        }
      - {
          name: "Antigravity",
          href: "guide/antigravity/",
          note: "reprise dans sa sandbox",
        }
      - {
          name: "Harness Outpost",
          href: "guide/model-loop/",
          note: "modèles OpenAI et Anthropic",
        }
    sandboxes:
      - { name: "Docker", href: "guide/docker/", note: "conteneur local" }
      - { name: "Podman", href: "guide/podman/", note: "conteneur local" }
      - { name: "Vercel", href: "guide/vercel-cloud/", note: "sandbox cloud" }
      - { name: "Daytona", href: "guide/daytona-cloud/", note: "sandbox cloud" }
      - {
          name: "Processus hôte",
          href: "guide/host-process/",
          note: "explicite, sans isolation",
        }
      - { name: "Firecracker", href: "guide/microvms/", note: "microVM" }
  workflow:
    title: "D’une tâche à un workflow persistant"
    text: "Une correction, un résumé typé et une validation humaine, avec des checkpoints pour que l’exécution puisse s’arrêter et reprendre sans refaire le travail terminé."
    stepsLabel: "Étapes du workflow"
    steps:
      - {
          title: "Un agent dans sa propre sandbox",
          text: "La tâche fix alloue sa propre sandbox, exécute l’agent de votre configuration sur une branche nommée et libère la sandbox à la fin.",
          lines: "11-21",
        }
      - {
          title: "Des résultats typés en aval",
          text: "context.value(fix) est le résultat de la tâche fix, entièrement typé. Le résumé ne démarre qu’après sa réussite.",
          lines: "22-29",
        }
      - {
          title: "Un humain décide",
          text: "L’étape de validation met l’exécution en pause jusqu’à ce qu’un acteur autorisé approuve ou rejette le changement.",
          lines: "30-35",
        }
      - {
          title: "Checkpoints et reprise",
          text: "Les tâches terminées sont conservées dans le store de checkpoints. Relancer avec la décision reprend l’exécution.",
          lines: "37-49",
        }
    link: { label: "Exécutions persistantes", href: "guide/durable-runs/" }
  footer:
    documentation:
      title: "Documentation"
      links:
        - { label: "Guide", href: "guide/introduction/" }
        - { label: "Référence", href: "reference/" }
        - { label: "Changelog", href: "project/changelog/" }
        - { label: "Roadmap", href: "project/roadmap/" }
    source:
      title: "Sources"
      links:
        - {
            label: "GitLab",
            href: "https://gitlab.elielaloum.com/elielaloum/outpost",
          }
        - {
            label: "Miroir GitHub",
            href: "https://github.com/elie-laloum/outpost",
          }
        - {
            label: "npm",
            href: "https://www.npmjs.com/package/@elie-laloum/outpost",
          }
    license: "Publié sous licence MIT."
---

Outpost exécute des agents de code depuis TypeScript. Choisissez un agent et une sandbox, donnez-lui un workspace Git et composez ses résultats en workflows typés et persistants. Commencez par le [guide de configuration](guide/setup/) ou consultez une API dans la [référence](reference/).
