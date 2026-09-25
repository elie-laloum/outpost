---
title: "Outbound networking — Overview"
description: "An egress policy describes which outbound network access an execution environment should have."
sidebar:
  label: Overview
  order: 0
---

An egress policy describes which outbound network access an execution environment should have. It is an environment capability, independent of the agent’s prompt or permission instructions. A policy is meaningful only when the chosen provider can enforce it.

## How it works

`EgressPolicy` expresses the requested policy. The provider validates supported modes and applies the corresponding backend controls during environment setup. The practical guide demonstrates a supported restriction and verifies the result with an actual command.

## Boundaries and responsibilities

These policies are opt-in research capabilities, not a portable promise that every backend supports every rule. Unsupported requests must fail explicitly. Network controls do not replace repository isolation, credential scoping or the security properties of the underlying host.

## Entry points

- [EgressPolicy](../../egresspolicy/)

[Learn with the practical guide](../../../guide/advanced/egress/).
