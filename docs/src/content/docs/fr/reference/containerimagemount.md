---
title: "ContainerImageMount"
description: "ContainerImageMount — Outpost API"
sidebar:
  order: 20
---

## Import

Choisissez un seul de ces imports équivalents.

```ts
import type { ContainerImageMount } from "@elie-laloum/outpost/providers/docker";
```

```ts
import type { ContainerImageMount } from "@elie-laloum/outpost/providers/podman";
```

## Paramètres et propriétés

| Nom      | Type                  | Présence  | Rôle                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| -------- | --------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `image`  | `string`              | Requis    | Référence d’une image que le moteur possède déjà, comme registry.example.com/tools:1 ou un digest image@sha256. Outpost ne la télécharge jamais : récupérez-la ou chargez-la d’abord sur l’hôte du moteur, comme l’image de la sandbox. Elle suit les règles de l’image de la sandbox (non vide, sans - initial, sans espace ni caractère de contrôle) et ne peut pas contenir de virgule ni de guillemet, que les analyseurs --mount des moteurs traitent comme séparateurs.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `path`   | `string \| undefined` | Optionnel | Chemin POSIX absolu dans l’image à monter au lieu de l’image entière, comme /usr/local/bin ; / ou l’absence de valeur monte toute l’image. Il doit être normalisé, sans segment ., .. ou vide, ni barre oblique finale, virgule, guillemet ou caractère de contrôle. Demande Docker Engine 28.0 ou Podman 5.1 au minimum.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `target` | `string`              | Requis    | Chemin absolu dans la sandbox, ou chemin commençant par ~/ dans le home de l’agent. Elle ne peut pas être ni contenir la racine du workspace, le home de l’agent ou /tmp, ne peut pas se trouver dans la racine du workspace, où le moteur créerait le point de montage dans un répertoire de l’hôte, et ne peut pas chevaucher /outpost ; en mode isolé, elle ne peut pas non plus chevaucher /tmp. Une cible relative se résout dans la racine du workspace et est donc refusée. Préférez un enfant direct du home comme ~/tools, ou un chemin en dehors comme /opt/tools : pour une cible plus profonde dans le home, le moteur crée les dossiers manquants avec root pour propriétaire, où l’agent ne peut pas écrire, et un volume d’un seul fichier ne peut pas se trouver sous un montage d’image dans le home. Un montage imbriqué sous la cible d’un montage d’image exige que son point de montage existe déjà dans l’image en lecture seule. Elle ne peut pas contenir de virgule, de guillemet ni de caractère de contrôle. |

## Signature

```ts
export interface ContainerImageMount {
  readonly image: string;
  readonly path?: string;
  readonly target: string;
}
```
