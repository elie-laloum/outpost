---
title: "Masquer les secrets dans les traces"
description: "Appliquez des règles de masquage avant qu’Outpost enregistre ou transmette des chaînes sensibles."
---

Enregistrez ces fichiers ensemble et lancez `node redact.ts`. L’observateur affiche `[REDACTED]` à la place de l’identifiant fictif ; aucun appel de modèle n’est nécessaire.

## Appliquer une règle de masquage

Créez un observateur pour afficher la sortie de commande.

```ts title="events.ts"
import { createObservationHub } from "@elie-laloum/outpost";

export const observation = createObservationHub({
  sinks: [
    {
      observe({ event }) {
        if (event.kind === "command-output") console.log(event.text);
      },
    },
  ],
});
```

Passez `redact` au workflow. Les chaînes correspondantes sont masquées avant chaque récepteur local ou hérité, y compris les journaux et les anciens callbacks d’observation. `dispatch()` et `createObservationHub()` acceptent la même politique.

```ts title="redact.ts"
import { defineTask, defineWorkflow } from "@elie-laloum/outpost";
import { observation } from "./events.ts";
const task = defineTask({
  key: "record",
  perform(context) {
    context.observation?.emit("sandbox", {
      kind: "command-output",
      channel: "stdout",
      text: "sk-exampleSecret123456789012345",
    });
  },
});
await defineWorkflow("private", [task]).start({
  observation,
  redact: [/sk-[A-Za-z0-9]{20,}/g],
});
await observation.close();
```

<!-- check:run -->

## Protéger les captures et rapports

Les règles masquent aussi les transcripts pris en charge, leurs fichiers annexes et les bundles Copilot/Kimi décodés avant archivage. Les entrées binaires sont refusées quand le masquage est activé. `result.report()` masque son instantané.

:::caution
La reprise lit la conversation masquée. Les valeurs cachées et le raisonnement signé peuvent ne plus être rejouables.
:::

## Savoir ce qui reste visible

- Les prompts envoyés à l’agent et les valeurs retournées gardent leur contenu original.
- Les fichiers du dépôt, checkpoints, anciennes archives, journaux applicatifs, fichiers natifs de la CLI et fichiers temporaires de transfert ne sont pas réécrits.
- Les règles traitent chaque chaîne séparément. Elles ne rassemblent pas les fragments diffusés et ne découvrent ni les clés inconnues ni les encodages arbitraires.

Choisissez des expressions adaptées à vos identifiants, évitez de diffuser les secrets par fragments et préférez un répertoire personnel privé et éphémère pour l’agent. Gardez les identifiants hors des prompts.

API : [ObservationHubOptions](../../reference/observationhuboptions/) · [DispatchOptions](../../reference/dispatchoptions/) · [WorkflowOptions](../../reference/workflowoptions/).
