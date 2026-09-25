---
title: "Réseau sortant — Vue d’ensemble"
description: "Une politique réseau sortante décrit les accès réseau qu’un environnement d’exécution doit posséder."
sidebar:
  label: Vue d’ensemble
  order: 0
---

Une politique réseau sortante décrit les accès réseau qu’un environnement d’exécution doit posséder. C’est une capacité d’environnement indépendante du prompt ou des consignes de permission de l’agent. Une politique n’a de sens que si le provider choisi peut l’imposer.

## Fonctionnement et philosophie

`EgressPolicy` exprime la politique demandée. Le provider valide les modes pris en charge et applique les contrôles correspondants lors de la préparation de l’environnement. Le guide pratique montre une restriction prise en charge et vérifie le résultat avec une vraie commande.

## Limites et responsabilités

Ces politiques sont des capacités de recherche activées explicitement, pas la promesse portable que chaque backend prend en charge toute règle. Les demandes non prises en charge doivent échouer explicitement. Les contrôles réseau ne remplacent ni l’isolation du dépôt, ni la portée des identifiants, ni les propriétés de sécurité de l’hôte.

## Points d’entrée

- [EgressPolicy](../../egresspolicy/)

[Passer à la pratique avec le Guide](../../../guide/advanced/egress/).
