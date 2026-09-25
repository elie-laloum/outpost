---
title: "Artefacts typés — Vue d’ensemble"
description: "Un artefact est une valeur stockée publiée sous un contrat typé explicite."
sidebar:
  label: Vue d’ensemble
  order: 0
---

Un artefact est une valeur stockée publiée sous un contrat typé explicite. Sa référence circule dans les résultats du workflow tandis que ses octets restent dans un store indépendant. Cette séparation découple l’échange de données de la durée de vie de la sandbox productrice.

## Fonctionnement et philosophie

`artifact` définit le contrat. La publication valide et stocke une valeur ; la lecture vérifie le contrat attendu et l’intégrité du contenu. `artifactTask` et `readArtifact` relient ces opérations aux dépendances déclarées des tâches. Les références du producteur et des parents enregistrent la filiation.

## Limites et responsabilités

Digests et filiation apportent intégrité et traçabilité, pas authentification du producteur. L’appelant possède la politique de rétention : conservez les objets tant que des résultats sauvegardés les référencent. Fermer une sandbox ne supprime pas un store d’artefacts géré indépendamment.

## Points d’entrée

- [artifact](../../artifact/)
- [publishArtifact](../../publishartifact/)
- [readStoredArtifact](../../readstoredartifact/)
- [artifactTask](../../artifacttask/)
- [readArtifact](../../readartifact/)
- [ArtifactStore](../../artifactstore/)

[Passer à la pratique avec le Guide](../../../guide/advanced/artifacts/).
