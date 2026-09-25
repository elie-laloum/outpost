---
title: "Écrire un adapter d’agent"
description: "Écrire un adapter d’agent — Outpost"
sidebar:
  order: 1
---

Implémentez `AgentAdapter` pour connecter un autre CLI natif sans changer l’allocation des sandboxes ni les workflows. Séparez construction des commandes et décodage du protocole lorsque l’adapter grandit.

```ts
import type { AgentAdapter } from "@elie-laloum/outpost";

const adapter: AgentAdapter = {
  name: "example",
  resumable: false,
  capture: false,
  request(input) {
    if (input.continuation) throw new Error("Continuation is unsupported");
    return {
      executable: "example-agent",
      arguments: ["run", input.text ?? ""],
    };
  },
  events(line) {
    return [{ kind: "text", text: line }];
  },
};
console.log(adapter.name);
```

Cet exemple illustre le port, pas un outil installé : fournissez votre exécutable et son protocole. `request(input)` reçoit texte, mode interactif et continuation éventuels, puis retourne un `Command`. `events(line)` produit zéro ou plusieurs événements normalisés. Gardez les messages inconnus dans `raw` lorsqu’ils aident au diagnostic ; n’inventez ni tokens ni identifiants.

## Capacités facultatives

`variables` déclare l’environnement de l’adapter. `resumable` indique si une réparation de réponse peut reprendre une conversation. `storage` fournit un `ConversationStore` personnalisé ; `conversations` sélectionne un format natif intégré. `capture` contrôle la capture, et `transcriptUsage(text)` peut fournir des compteurs faisant autorité.

Émettez `conversation` lorsque le CLI fournit l’identifiant, `usage` pour les compteurs, `result` pour la réponse finale et `failure` pour les erreurs du protocole. `finished` seul ne remplace pas le marqueur textuel configuré.

Testez les arguments en mode normal, interactif, reprise et fork. Couvrez les entrées partielles/bruitées, événements inconnus, annulation via le provider et transcripts invalides. L’adapter ne gère pas le nettoyage du workspace.
