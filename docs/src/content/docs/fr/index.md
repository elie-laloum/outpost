---
title: Outpost
description: "Exécutez des agents de code en TypeScript. Claude Code, Codex, Copilot CLI et Kimi Code dans une sandbox que vous maîtrisez, sur une branche Git que vous contrôlez."
landing:
  headline:
    - "Exécutez des agents de code"
    - "en TypeScript."
  tagline: "Exécutez un agent, maîtrisez son environnement, composez un workflow."
  lead: "Claude Code, Codex, Copilot CLI et Kimi Code, dans une sandbox Docker, Podman ou cloud que vous maîtrisez, sur une branche Git que vous contrôlez. Votre code garde l’ordre, les vérifications et la reprise ; l’agent ne reçoit que le travail qui demande du jugement."
  hero:
    caption: "Une tâche de bout en bout : une sandbox, une branche nommée, la réponse de l’agent et ses commits."
  install:
    command: "npx @elie-laloum/outpost init"
    copy: "Copier la commande d’installation"
    copied: "Copié"
    prerequisites: "Il vous faut Node.js 24+, un dépôt Git avec au moins un commit, Docker ou Podman démarré, et la CLI de votre agent connectée."
    outcome: "La commande écrit `run.ts`, `brief.md`, un `Dockerfile` et votre configuration, puis construit l’image de l’agent. Ensuite :"
    next: 'node run.ts "Describe this repository"'
  primary: { label: "Commencer", href: "guide/setup/" }
  secondary: { label: "Lire le guide", href: "guide/introduction/" }
  facts: "MIT"
  evidence:
    - "CI sur Windows, macOS et Linux"
    - "Tests Docker et Podman réels"
    - "Seuil de couverture à 80 %"
    - "Publication npm avec provenance"
  reference: { label: "Référence de l’API", href: "reference/" }
  useCases:
    title: "Ce que vous pouvez lancer"
    text: "Chaque cas est une page du guide : le code, les contrats qu’il utilise et ce qui revient."
    link: { label: "Votre première tâche", href: "guide/first-request/" }
    entries:
      - title: "Réparer une CI en échec"
        text: "Un agent corrige les tests sur une branche, et Outpost les relance après chaque tentative en lui renvoyant les échecs."
        href: "guide/fix-failing-ci/"
      - title: "Relire une pull request à la demande"
        text: "Un label sur une pull request met une revue en file, et votre code publie le verdict typé qu’elle renvoie."
        href: "guide/review-on-label/"
      - title: "Maintenance nocturne"
        text: "Chaque nuit de semaine, un agent met à jour les dépendances sur une branche datée et laisse un rapport typé pour le matin."
        href: "guide/nightly-maintenance/"
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
      title: "Le modèle orchestre"
      context: "Contexte"
      captions:
        - "Le modèle interprète chaque étape, même les plus sûres."
        - "Chaque étape s’ajoute à la conversation qu’il relit."
        - "Le modèle décide de l’ordre en chemin, et peut dériver."
        - "Après une interruption, le modèle relit tout."
    code:
      title: "Votre code orchestre"
      context: "Contexte"
      captions:
        - "Votre code crée la branche, vérifie et intègre. L’agent corrige, c’est tout."
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
  typed:
    title: "L’agent répond en prose. Votre code reçoit une valeur typée."
    text: "Déclarez la réponse avec un schéma Zod. Outpost extrait le bloc balisé de la réponse de l’agent, le valide contre votre schéma et vous rend `result.value` typé depuis celui-ci. Une réponse qui ne passe pas le schéma n’est pas à vous de rattraper : l’agent obtient des tours de réparation sur la même conversation, et une exécution qui échoue encore lève une erreur plutôt que de livrer de mauvaises données à votre code."
    link: { label: "Réponses typées", href: "guide/typed-responses/" }
    secondary:
      { label: "Relire une pull request", href: "guide/review-on-label/" }
    declareLabel: "Vous déclarez la réponse"
    answerLabel: "L’agent répond"
    answerText: "J’ai relu le dernier commit. Le correctif est juste, mais il n’a pas de test de régression."
    answerTag: '<verdict>{"approved": false, "reasons": ["pas de test de régression"]}</verdict>'
    valueLabel: "Votre code reçoit result.value"
    value: '{ approved: false, reasons: ["pas de test de régression"] }'
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
      - { name: "Firecracker", href: "guide/firecracker/" }
    link: { label: "Choisir un agent", href: "guide/choose-an-agent/" }
  boundaries:
    title: "Quand Outpost n’est pas la réponse"
    text: "Outpost prend en charge les étapes autour de l’agent. Quand ces étapes ne sont pas les vôtres, un outil plus petit convient mieux."
    entries:
      - lead: "Une seule session d’agent suffit"
        text: "Si toute la tâche tient dans une conversation, lancez la CLI de l’agent directement. Outpost prend son sens quand la branche, les vérifications, l’ordre et la reprise vous appartiennent."
      - lead: "Une seule étape de CI"
        text: "Un fichier de workflow qui lance un agent et s’arrête demande moins de code. Outpost lance la même tâche depuis la CI, une file, un créneau cron ou un webhook vérifié, et garde le checkpoint quand le worker redémarre."
      - lead: "Vous voulez seulement lire"
        text: "Une question sur le code ne produit ni branche, ni commits, ni rien qu’un contrôle puisse valider. Lancez l’agent dans votre terminal et gardez la réponse."
    link: { label: "Files de jobs et workers", href: "guide/job-queues/" }
    action:
      { label: "Commencer par le guide d’installation", href: "guide/setup/" }
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

Outpost exécute des agents de code dans une sandbox que vous maîtrisez, depuis des workflows écrits en TypeScript. Le code garde l’ordre, les vérifications et la reprise ; l’agent reçoit le travail qui demande du jugement. Commencez par le [guide de configuration](guide/setup/) ou consultez une API dans la [référence](reference/).
