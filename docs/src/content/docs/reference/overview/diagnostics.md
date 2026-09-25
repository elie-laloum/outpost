---
title: "Diagnostics — Overview"
description: "Diagnostics answer whether an environment provides the capabilities an operation needs."
sidebar:
  label: Overview
  order: 0
---

Diagnostics answer whether an environment provides the capabilities an operation needs. They separate missing tools, unsupported features and protocol problems from failures in the coding task itself. A report gives evidence to inspect before launching more work.

## How it works

`diagnoseSandbox` probes an existing sandbox under its operation ownership rules. `diagnoseAgentProtocol` exercises the selected agent protocol and reports what it observed. Capability checks, tool versions and protocol execution answer different questions; choose the diagnostic matching the symptom.

## Boundaries and responsibilities

A diagnostic does not take ownership of closing a supplied sandbox. A binary/version check does not prove account access or successful model execution. Protocol probes can execute an agent and require its declared credentials; inspect their options before running them.

## Entry points

- [diagnoseSandbox](../../diagnosesandbox/)
- [SandboxDiagnosticReport](../../sandboxdiagnosticreport/)
- [DiagnosticCheck](../../diagnosticcheck/)
- [diagnoseAgentProtocol](../../diagnoseagentprotocol/)
- [AgentProtocolReport](../../agentprotocolreport/)

[Learn with the practical guide](../../../guide/operations/doctor/).
