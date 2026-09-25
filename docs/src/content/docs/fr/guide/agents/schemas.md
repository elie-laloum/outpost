---
title: "Utiliser des schémas Zod, Valibot ou Ajv"
description: "Remplacez les vérifications manuelles par des schémas typés réutilisables pour les réponses et les artefacts JSON."
---

`response.json({ schema })` et `artifact.json({ schema })` acceptent un validateur qui renvoie la valeur validée ou lève une erreur, de manière synchrone ou asynchrone. Ils acceptent aussi directement les objets [Standard Schema](https://standardschema.dev/schema), dont les schémas Zod 4 et Valibot 1. Installez la bibliothèque choisie dans votre projet de workflow ; Outpost ne l’exige pas dans la sandbox et ne l’embarque pas comme dépendance d’exécution.

Choisissez Zod pour une API chaînable, Valibot pour une API fonctionnelle modulaire, ou Ajv si vous maintenez déjà des JSON Schema. Les exemples ci-dessous partagent un contrat : un objet contenant une chaîne `endpoint`. Ils rejettent volontairement les propriétés inconnues pour que les trois variantes se comportent de la même façon. Aucun classement de performances n’est présumé ; mesurez vos schémas réels si la validation devient un goulot d’étranglement.

<!-- scenario:offline -->

<!-- preparation:offline -->

<details>
<summary>Préparer cet exemple depuis zéro</summary>

Utilisez Node.js **24+** et npm. Commencez dans un nouveau dossier pour chaque exemple.

```sh
mkdir outpost-example
cd outpost-example
```

```sh
npm init -y
npm install @elie-laloum/outpost
```

Enregistrez l’exemple sous **example.mts** dans ce dossier. Aucun compte, clé API ou conteneur n’est nécessaire.

</details>

<!-- /preparation -->

Installez les trois bibliothèques pour exécuter cette comparaison. Dans votre propre workflow, installez uniquement celle que vous utilisez.

```sh
npm install zod@4 valibot@1 ajv@8
```

Enregistrez les fichiers suivants à côté de **example.mts**.

## Définir un schéma Zod

Enregistrez **zod-schema.mts**. Passer directement l’objet schéma préserve l’inférence du type de sortie sans fonction intermédiaire ni assertion de type manuelle.

```ts file=zod-schema.mts
import { z } from "zod";

export const apiSchema = z.strictObject({
  endpoint: z.string(),
});
```

[`z.strictObject`](https://zod.dev/api#zstrictobject) rejette les clés inconnues. Utilisez `z.object` si vous voulez les accepter puis les supprimer, comme le ferait un validateur manuel renvoyant uniquement `{ endpoint }`.

## Définir un schéma Valibot

Enregistrez **valibot-schema.mts**. Valibot expose la même interface de validation Standard Schema ; l’appel Outpost reste donc identique.

```ts file=valibot-schema.mts
import * as v from "valibot";

export const apiSchema = v.strictObject({
  endpoint: v.string(),
});
```

[`v.strictObject`](https://valibot.dev/api/strictObject/) rejette les clés inconnues ; `v.object` les supprime à la place.

## Adapter un validateur Ajv

Enregistrez **api.types.ts**. Le type `JSONSchemaType` d’Ajv vérifie le JSON Schema par rapport à ce type TypeScript déclaré.

```ts file=api.types.ts
export interface Api {
  endpoint: string;
}
```

Enregistrez **ajv-schema.mts**. Compilez une seule fois et réutilisez le validateur. Un validateur Ajv synchrone renvoie un booléen ; le contrat de fonction d’Outpost exige la valeur validée en cas de succès et une exception en cas d’échec. Passer directement `validate` ferait de la réponse un booléen, même pour des données rejetées.

```ts file=ajv-schema.mts
import { Ajv } from "ajv";
import type { JSONSchemaType } from "ajv";
import type { Api } from "./api.types.ts";

const ajv = new Ajv();
const definition: JSONSchemaType<Api> = {
  type: "object",
  properties: { endpoint: { type: "string" } },
  required: ["endpoint"],
  additionalProperties: false,
};
const validate = ajv.compile(definition);

export function apiSchema(input: unknown): Api {
  if (!validate(input)) throw new Error(ajv.errorsText(validate.errors));
  return input;
}
```

Cet adaptateur concerne les schémas Ajv synchrones, avec son comportement par défaut sans coercition. Les schémas `$async` d’Ajv demandent d’attendre la validation et de gérer son rejet séparément. Consultez le [guide TypeScript d’Ajv](https://ajv.js.org/guide/typescript.html) et la [réutilisation des validateurs](https://ajv.js.org/guide/getting-started).

## Réutiliser un schéma pour les réponses et les artefacts

Enregistrez **example.mts**. La même option `schema` fonctionne avec un objet Standard Schema ou l’adaptateur Ajv. La boucle exerce les trois variantes ; une application peut importer un seul schéma et utiliser directement les deux appels de création.

```ts file=example.mts
import assert from "node:assert/strict";
import { artifact, response, ResponseError } from "@elie-laloum/outpost";
import { apiSchema as zodSchema } from "./zod-schema.mts";
import { apiSchema as valibotSchema } from "./valibot-schema.mts";
import { apiSchema as ajvSchema } from "./ajv-schema.mts";

for (const [name, schema] of [
  ["Zod", zodSchema],
  ["Valibot", valibotSchema],
  ["Ajv", ajvSchema],
] as const) {
  const report = response.json({ tag: "api", schema });
  const contract = artifact.json({ name: "api", version: "1", schema });

  const value = await report.read('<api>{"endpoint":"/users"}</api>');
  const endpoint: string = value.endpoint;
  const bytes = await contract.encode(value);
  assert.deepEqual(await contract.decode(bytes), { endpoint });

  for (const invalid of [{}, { endpoint: 42 }, { endpoint, extra: true }]) {
    const json = JSON.stringify(invalid);
    await assert.rejects(report.read(`<api>${json}</api>`), ResponseError);
    await assert.rejects(contract.decode(new TextEncoder().encode(json)));
  }

  console.log(`${name}: ${endpoint}; invalid payloads rejected`);
}
```

```sh
node example.mts
```

## Comprendre le résultat

Le programme affiche une ligne de succès par bibliothèque avec `/users` et confirme le rejet des champs manquants, des types incorrects et des propriétés inconnues. TypeScript infère `{ endpoint: string }` pour la valeur de réponse. L’encodage et le décodage de l’artefact utilisent le même validateur. Cet exemple garde les octets en mémoire, n’alloue aucune sandbox et ne crée aucun stockage d’artefacts ; seuls les fichiers de démonstration et les paquets installés restent sur disque.

Passez la spécification de réponse comme `response` à `dispatch` pour recevoir la sortie validée dans `result.value`. Le prompt de l’agent doit toujours demander la balise et les données correspondantes, par exemple `Return <api>{"endpoint":"/users"}</api>`. Outpost ne déduit pas de ces validateurs un JSON Schema destiné à l’agent. La validation vérifie la structure des données, pas l’existence de l’endpoint.

Les échecs de validation d’une réponse sont encapsulés dans `ResponseError` ; ceux d’un artefact font échouer l’encodage ou le décodage. Configurer `repairs` concerne l’exécution d’un agent avec un adaptateur capable de reprendre une conversation, pas un appel direct à `report.read()`. Consultez le [guide des réponses](../responses/) et la [propriété et le stockage des artefacts](../../advanced/artifacts/).

## Transformations et validation asynchrone

Outpost attend le résultat des fonctions de validation comme des validateurs Standard Schema, puis utilise la sortie renvoyée. Avec des transformations, cette sortie peut différer de l’entrée ; son type détermine celui de la valeur de réponse.

Pour les artefacts, la validation intervient à l’encodage et au décodage. Réutilisez des schémas qui acceptent leur propre sortie sérialisée et restent stables lors de validations répétées. Une transformation d’une chaîne en `Date`, par exemple, ne convient pas à ce contrat d’artefact JSON : l’encodage exige des valeurs JSON sans perte. Conservez des valeurs compatibles JSON, comme des chaînes ISO, dans les contrats persistants.

La forme manuelle existante `schema(input) { ... }` reste utile pour une logique personnalisée. Elle doit renvoyer la valeur validée et lever une erreur ou rejeter la promesse en cas d’échec ; renvoyer `false` constitue un résultat booléen réussi, pas une erreur de validation.
