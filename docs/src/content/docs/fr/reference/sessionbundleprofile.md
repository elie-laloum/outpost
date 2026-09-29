---
title: "SessionBundleProfile"
description: "SessionBundleProfile — Outpost API"
sidebar:
  order: 20
---

## Import

```ts
import type { SessionBundleProfile } from "@elie-laloum/outpost";
```

## Paramètres et propriétés

| Nom         | Type                                                                                         | Présence  | Rôle                                                                                                                                                                                                                        |
| ----------- | -------------------------------------------------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `format`    | `string`                                                                                     | Requis    | Nom de format persisté, utilisé dans les bundles, les clés de transport et les chemins hôte .outpost/conversations/&lt;format>.                                                                                             |
| `root`      | `{ readonly variable?: string; readonly directory: string; }`                                | Requis    | Home de la CLI dans la sandbox : la valeur de la variable d’environnement variable si elle est définie, sinon directory sous le home de l’agent.                                                                            |
| `sessions`  | `string`                                                                                     | Requis    | Dossier sous le home de la CLI qui contient les dossiers de session.                                                                                                                                                        |
| `buckets`   | `boolean \| undefined`                                                                       | Optionnel | Indique si les sessions sont rangées dans &lt;sessions>/&lt;bucket>/&lt;id>. La capture exige une seule correspondance parmi les buckets, et la restauration refuse un id déjà présent sous un autre bucket.                |
| `include`   | `RegExp`                                                                                     | Requis    | Chemins relatifs au bundle à capturer ; un dossier est testé sur son propre chemin avant ses fichiers. Les options g et y sont refusées.                                                                                    |
| `exclude`   | `RegExp \| undefined`                                                                        | Optionnel | Chemins relatifs au bundle ignorés même quand include les accepte, comme les journaux ou les verrous.                                                                                                                       |
| `required`  | `readonly string[]`                                                                          | Requis    | Fichiers obligatoires ; une session à laquelle il en manque un est refusée comme incomplète.                                                                                                                                |
| `relocated` | `readonly string[] \| undefined`                                                             | Optionnel | Fichiers transmis comme texte à relocate pendant la restauration ; les autres sont restaurés à l’identique.                                                                                                                 |
| `validate`  | `((files: SessionBundleFiles, id: string) => string \| undefined) \| undefined`              | Optionnel | Fonction autonome qui renvoie un message d’erreur quand la session du bundle utilise des métadonnées non prises en charge. Elle s’exécute dans la sandbox à la capture et sur l’hôte quand un bundle existant est localisé. |
| `bucket`    | `((cwd: string, helpers: SessionBundleHelpers) => string) \| undefined`                      | Optionnel | Fonction autonome qui nomme le bucket utilisé par la restauration pour le workspace de destination ; obligatoire quand buckets vaut true.                                                                                   |
| `relocate`  | `((path: string, text: string, relocation: SessionBundleRelocation) => string) \| undefined` | Optionnel | Fonction autonome qui réécrit un fichier relocalisé pour le workspace de destination et renvoie son nouveau texte ; lever une erreur annule la restauration sans remplacer la session existante.                            |

## Signature

```ts
export interface SessionBundleProfile {
  /** Persisted format name, used in bundles, transport keys and host paths. */
  readonly format: string;
  /** CLI home: `$variable` when set, otherwise `directory` under the agent home. */
  readonly root: {
    readonly variable?: string;
    readonly directory: string;
  };
  /** Directory under the CLI home that holds sessions. */
  readonly sessions: string;
  /** Sessions are grouped in `<sessions>/<bucket>/<id>` instead of `<sessions>/<id>`. */
  readonly buckets?: boolean;
  /** Bundle-relative paths to capture; a directory is tested by its own path. */
  readonly include: RegExp;
  readonly exclude?: RegExp;
  /** Files whose absence makes the session unusable. */
  readonly required: readonly string[];
  /** Files passed to `relocate` as text during restoration. */
  readonly relocated?: readonly string[];
  /** Returns an error message when the bundled session is unsupported. */
  readonly validate?: (
    files: SessionBundleFiles,
    id: string,
  ) => string | undefined;
  /** Bucket that restoration uses for a workspace; required with `buckets`. */
  readonly bucket?: (cwd: string, helpers: SessionBundleHelpers) => string;
  /** Rewrites one relocated file for the restored workspace. */
  readonly relocate?: (
    path: string,
    text: string,
    relocation: SessionBundleRelocation,
  ) => string;
}
```

## Contrats associés

- [SessionBundleFiles](../sessionbundlefiles/)
- [SessionBundleHelpers](../sessionbundlehelpers/)
- [SessionBundleRelocation](../sessionbundlerelocation/)
