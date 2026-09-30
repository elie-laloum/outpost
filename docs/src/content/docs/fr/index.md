---
title: Outpost
description: "Le code orchestre. Les agents réfléchissent. Une bibliothèque TypeScript pour exécuter des agents de code dans des workflows écrits en code."
landing:
  headline:
    - "Le code orchestre."
    - "Les agents réfléchissent."
  tagline: "Exécutez un agent, maîtrisez son environnement, composez un workflow."
  lead: "Outpost est une bibliothèque TypeScript pour exécuter des agents de code dans des workflows écrits en code. L’ordre, les vérifications et la reprise restent dans le code ; l’agent ne reçoit que le travail qui demande du jugement."
  install:
    command: "npx @elie-laloum/outpost init"
    copy: "Copier la commande d’installation"
    copied: "Copié"
  primary: { label: "Commencer", href: "guide/setup/" }
  secondary: { label: "Lire le guide", href: "guide/introduction/" }
  facts: "Node.js 24+ · MIT"
  reference: { label: "Référence de l’API", href: "reference/" }
  demo:
    title: "Une tâche, deux orchestrateurs"
    pause: "Mettre la comparaison en pause"
    replay: "Rejouer la comparaison"
    beatsLabel: "Comparer"
    beats: ["Étapes", "Contexte", "Ordre", "Reprise"]
    steps: ["Branche", "Correctif", "Vérification", "Intégration"]
    owners: { model: "modèle", code: "code", agent: "agent" }
    notes: { early: "trop tôt", reread: "relu", restored: "restauré" }
    interrupted: "Interruption"
    model:
      title: "Un LLM orchestre"
      context: "Contexte du modèle"
      captions:
        - "Le modèle interprète chaque étape, même les plus sûres."
        - "Chaque étape s’ajoute à la conversation qu’il relit."
        - "Il décide de l’ordre en chemin, et peut dériver."
        - "Après une interruption, il relit tout."
    code:
      title: "Le code orchestre"
      context: "Contexte de l’agent"
      captions:
        - "Le code crée la branche, vérifie et intègre. L’agent corrige, c’est tout."
        - "L’agent part de son brief, rien de plus."
        - "L’ordre est un graphe de tâches, fixé avant l’exécution."
        - "Les étapes terminées reviennent du checkpoint."
  problem:
    title: "On demande tout aux modèles"
    text: "Un LLM excelle dans le jugement : lire du code, écrire un correctif, relire une modification. La plupart des pipelines d’IA lui confient aussi les étapes, l’ordre et la reprise, que le code fait mieux."
    link: { label: "Comment fonctionne Outpost", href: "guide/how-it-works/" }
    answerLabel: "Avec Outpost"
    groups:
      - title: "Avec les LLM aujourd’hui"
        rows:
          - pain: "Tout est interprété"
            detail: "Même un nom de branche ou une commande de test passe par le modèle, à chaque fois."
            answer: "Le code exécute les étapes sûres. L’agent ne reçoit que le travail qui demande du jugement."
          - pain: "Le contexte ne cesse de grossir"
            detail: "Chaque étape s’ajoute à une seule conversation que le modèle relit."
            answer: "Chaque tâche d’agent part de son propre brief, dans sa propre sandbox."
      - title: "En construisant des workflows d’IA"
        rows:
          - pain: "L’orchestrateur dérive"
            detail: "Quand un modèle décide de l’ordre, il peut sauter, répéter ou réordonner des étapes."
            answer: "Le graphe de tâches est en TypeScript, validé avant l’exécution. Les réponses typées sont vérifiées contre leur schéma."
          - pain: "Reprendre, c’est réinterpréter"
            detail: "Après un crash ou un quota, le modèle reconstruit son état à partir d’une transcription."
            answer: "Les tâches terminées reviennent du checkpoint en JSON. Relancer une tâche interrompue demande votre accord explicite."
  workflow:
    title: "Seul le correctif va à l’agent"
    text: "Un workflow en TypeScript simple. Une tâche exécute un agent dans sa sandbox ; le code lit son résultat typé, attend un humain et reprend depuis un checkpoint."
    stepsLabel: "Étapes du workflow"
    copy: "Copier ce fichier"
    steps:
      - {
          title: "Une tâche d’agent",
          text: "L’agent reçoit un brief, sa propre sandbox et une branche nommée. Il corrige les tests ; il ne décide pas de la suite.",
          lines: "11-20",
        }
      - {
          title: "Le code lit un résultat typé",
          text: "fix et summary sont de simples fonctions. Elles lisent la branche et le nombre de commits comme des valeurs, pas comme du texte à interpréter.",
          lines: "21-33",
        }
      - {
          title: "Un humain décide",
          text: "L’étape de validation met l’exécution en pause jusqu’à ce qu’un acteur autorisé approuve ou rejette la fusion.",
          lines: "34-39",
        }
      - {
          title: "Reprendre sans relire",
          text: "Les tâches terminées sont conservées en JSON dans le checkpoint. Relancer les restaure au lieu de les exécuter de nouveau.",
          lines: "41-53",
        }
    link: { label: "Exécutions durables", href: "guide/durable-runs/" }
  runtimes:
    title: "Tout agent, toute sandbox"
    text: "Changer l’un ou l’autre tient en une ligne ; le workflow reste identique. Vous déclarez comment chaque agent s’authentifie, et une sandbox isolée ne se replie jamais sur votre machine."
    agentsLabel: "Agents"
    sandboxesLabel: "Sandboxes"
    experimental: "Expérimental"
    agents:
      - { name: "Claude Code", href: "guide/claude-code/" }
      - { name: "Codex", href: "guide/codex/" }
      - { name: "Kimi Code", href: "guide/kimi-code/" }
      - { name: "Copilot CLI", href: "guide/copilot-cli/" }
      - { name: "Antigravity", href: "guide/antigravity/" }
      - { name: "Harness Outpost", href: "guide/harness/" }
    sandboxes:
      - { name: "Docker", href: "guide/containers/" }
      - { name: "Podman", href: "guide/containers/#podman" }
      - { name: "Vercel", href: "guide/cloud-sandboxes/#vercel-sandbox" }
      - { name: "Daytona", href: "guide/cloud-sandboxes/#daytona-sandbox" }
      - { name: "Processus hôte", href: "guide/host-process/" }
      - { name: "Firecracker", href: "guide/firecracker/", experimental: true }
    link: { label: "Choisir un agent", href: "guide/choose-an-agent/" }
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

Outpost exécute des agents de code dans des workflows écrits en TypeScript. Le code garde l’ordre, les vérifications et la reprise ; l’agent reçoit le travail qui demande du jugement. Commencez par le [guide de configuration](guide/setup/) ou consultez une API dans la [référence](reference/).
