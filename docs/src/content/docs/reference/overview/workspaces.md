---
title: "Workspaces — Overview"
description: "A workspace owns the Git state of a task: its checkout, branch policy, baseline and lock."
sidebar:
  label: Overview
  order: 0
---

A workspace owns the Git state of a task: its checkout, branch policy, baseline and lock. It separates the work being produced from the environment used to produce it. The same workspace can therefore outlive a sandbox and host successive agent jobs.

## How it works

`openWorkspace` prepares and owns that Git context. The branch policy selects the current checkout or a managed branch. A workspace admits one active sandbox at a time; parallel work needs separate workspaces. Integration is explicit and distinct from collecting commits.

## Boundaries and responsibilities

Close the sandbox before its workspace. A caller-supplied workspace remains the caller’s responsibility. Closing resources must preserve dirty, detached or otherwise recoverable work; a retained directory tells you where to inspect it. Closing a workspace is not permission to push its branch.

## Entry points

- [openWorkspace](../../openworkspace/)
- [Workspace](../../workspace/)
- [WorkspaceOptions](../../workspaceoptions/)
- [BranchPolicy](../../branchpolicy/)
- [Disposal](../../disposal/)

[Learn with the practical guide](../../../guide/environment/workspaces/).
