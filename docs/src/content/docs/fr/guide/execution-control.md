---
title: "Limites d’exécution"
description: "Borner le travail d’un agent et l’annuler explicitement."
---

Utilisez les délais pour borner un processus, un signal pour annuler une opération et `passes` pour borner les passes de l’agent.

```ts
import type { DispatchOptions } from "@elie-laloum/outpost";

const request: DispatchOptions = {
  brief: { text: "Fix the parser, run tests and end with READY_FOR_REVIEW." },
  passes: 3,
  until: "READY_FOR_REVIEW",
  deadlineMs: 300_000,
  idleWarningMs: 30_000,
  idleMs: 90_000,
  signal: AbortSignal.timeout(600_000),
};
```

## Choisir la bonne limite

| Réglage         | Contrôle                                         |
| --------------- | ------------------------------------------------ |
| `deadlineMs`    | Chaque processus d’agent ; une heure par défaut. |
| `idleMs`        | Durée de silence autorisée.                      |
| `idleWarningMs` | Moment où avertir du silence.                    |
| `passes`        | Nombre maximal de passes ; une par défaut.       |
| `until`         | Marqueur de fin ; `[]` désactive sa recherche.   |
| `settleMs`      | Délai de grâce après détection de fin.           |
| `signal`        | Annulation de l’opération.                       |

Pour changer de direction sans annuler, [pilotez l’agent en cours](../steering/) plutôt que de l’interrompre.

Un marqueur de fin exprime la déclaration de l’agent, pas la preuve d’un changement réussi. Inspectez séparément `completed`, `completion` et les véritables résultats de validation.

Les `limits` du workspace bornent la copie, la préparation Git, la collecte et l’intégration. Les [budgets de tokens](../token-budgets/) bornent la consommation observée et les tentatives partagées du workflow ; ils ne remplacent pas les limites de facturation du fournisseur.

API : [DispatchOptions](../../reference/dispatchoptions/) · [StageLimits](../../reference/stagelimits/).
