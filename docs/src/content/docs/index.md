---
title: Outpost
description: "Run an agent, own its environment, compose a workflow."
landing:
  headline:
    - "Run an agent,"
    - "own its environment,"
    - "compose a workflow."
  lead: "Outpost is a TypeScript library and CLI for running coding agents in sandboxes you choose, on Git workspaces you control, as typed workflows that survive interruptions."
  install:
    command: "npx @elie-laloum/outpost init"
    copy: "Copy the install command"
    copied: "Copied"
  primary: { label: "Get started", href: "guide/setup/" }
  secondary: { label: "Read the guide", href: "guide/introduction/" }
  facts: "Node.js 24+ · MIT"
  reference: { label: "API reference", href: "reference/" }
  window:
    label: "Example project files"
    copy: "Copy this file"
    example: "example"
    notes:
      run: 'node run.ts "Fix the failing tests, verify and commit."'
      brief: "{{OBJECTIVE}} comes from the command line; Outpost fills the branch names."
      workflow: "Two reviews in parallel, each in its own Podman sandbox."
  run:
    title: "Run an agent"
    text: "Claude Code, Codex, Copilot CLI, Kimi Code, Antigravity or Outpost’s own harness, on Docker, Podman, Vercel, Daytona or your host. Changing either is a one-line edit; the dispatch stays the same."
    caption: "Swap the agent and the sandbox"
    link: { label: "Choose an environment", href: "guide/choose-a-sandbox/" }
  own:
    title: "Own its environment"
    text: "Nothing is implicit. You pick how each agent authenticates, where it runs and how its branch lands."
    ledger:
      - {
          term: "Credentials",
          detail: "Your account login or an API key, declared per harness. No system keychain.",
        }
      - {
          term: "Sandbox",
          detail: "Your provider. Isolated sandboxes never fall back to the host.",
        }
      - {
          term: "Branch",
          detail: "The current checkout, a named branch or an integrated one: your choice per dispatch.",
        }
      - { term: "Recovery", detail: "Kept whenever cleanup would lose work." }
    link: { label: "Credentials and boundaries", href: "guide/authentication/" }
  compose:
    title: "Compose a workflow"
    text: "Tasks pass typed results to each other. Runs checkpoint, wait for approvals, pause on quotas and resume the conversation where it stopped."
    primitives:
      - {
          name: "defineWorkflow",
          href: "reference/defineworkflow/",
          detail: "Validates the task graph",
        }
      - {
          name: "defineIsolatedTask",
          href: "reference/defineisolatedtask/",
          detail: "An agent with its own sandbox",
        }
      - {
          name: "defineApprovalTask",
          href: "reference/defineapprovaltask/",
          detail: "Waits for a human decision",
        }
      - {
          name: "defineLoopTask",
          href: "reference/definelooptask/",
          detail: "Retries with verification feedback",
        }
    link: { label: "Connect tasks", href: "guide/task-dependencies/" }
  runtimes:
    title: "Agents and sandboxes"
    text: "Any supported agent runs in any sandbox. Conversation support differs by agent, so each one is listed with what it can do."
    agentsLabel: "Agents"
    sandboxesLabel: "Sandboxes"
    experimental: "Experimental"
    agents:
      - {
          name: "Claude Code",
          href: "guide/claude-code/",
          note: "capture · resume · fork",
        }
      - { name: "Codex", href: "guide/codex/", note: "capture · resume · fork" }
      - {
          name: "Kimi Code",
          href: "guide/kimi-code/",
          note: "capture · resume · fork",
        }
      - {
          name: "Copilot CLI",
          href: "guide/copilot-cli/",
          note: "capture · resume",
        }
      - {
          name: "Antigravity",
          href: "guide/antigravity/",
          note: "resume in its sandbox",
        }
      - {
          name: "Outpost harness",
          href: "guide/harness/",
          note: "OpenAI and Anthropic models",
        }
    sandboxes:
      - { name: "Docker", href: "guide/containers/", note: "local container" }
      - {
          name: "Podman",
          href: "guide/containers/#podman",
          note: "local container",
        }
      - {
          name: "Vercel",
          href: "guide/cloud-sandboxes/#vercel-sandbox",
          note: "cloud sandbox",
        }
      - {
          name: "Daytona",
          href: "guide/cloud-sandboxes/#daytona-sandbox",
          note: "cloud sandbox",
        }
      - {
          name: "Host process",
          href: "guide/host-process/",
          note: "explicit, no isolation",
        }
      - { name: "Firecracker", href: "guide/firecracker/", note: "microVM" }
  workflow:
    title: "From one task to a durable workflow"
    text: "A fix, a typed summary and a human approval, checkpointed so the run can stop and resume without repeating finished work."
    stepsLabel: "Workflow steps"
    steps:
      - {
          title: "An agent in its own sandbox",
          text: "The fix task allocates its own sandbox, runs the agent from your Setup configuration on a named branch and releases the sandbox when it ends.",
          lines: "11-21",
        }
      - {
          title: "Typed results downstream",
          text: "context.value(fix) is the fix task’s result, fully typed. The summary starts only after it succeeds.",
          lines: "22-29",
        }
      - {
          title: "A human decides",
          text: "The approval gate pauses the run until an allowed actor approves or rejects the change.",
          lines: "30-35",
        }
      - {
          title: "Checkpointed and resumable",
          text: "Finished tasks persist in the checkpoint store. Starting again with the decision resumes the run.",
          lines: "37-49",
        }
    link: { label: "Durable runs", href: "guide/durable-runs/" }
  footer:
    documentation:
      title: "Documentation"
      links:
        - { label: "Guide", href: "guide/introduction/" }
        - { label: "Reference", href: "reference/" }
        - { label: "Changelog", href: "project/changelog/" }
        - { label: "Roadmap", href: "project/roadmap/" }
    source:
      title: "Source"
      links:
        - {
            label: "GitLab",
            href: "https://gitlab.elielaloum.com/elielaloum/outpost",
          }
        - {
            label: "GitHub mirror",
            href: "https://github.com/elie-laloum/outpost",
          }
        - {
            label: "npm",
            href: "https://www.npmjs.com/package/@elie-laloum/outpost",
          }
    license: "Released under the MIT License."
---

Outpost runs coding agents from TypeScript. Choose an agent and a sandbox, give it a Git workspace and compose its results into typed, durable workflows. Start with the [setup guide](guide/setup/) or look up an API in the [reference](reference/).
