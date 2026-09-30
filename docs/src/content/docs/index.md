---
title: Outpost
description: "Code orchestrates. Agents think. A TypeScript library for running coding agents inside workflows you write in code."
landing:
  headline:
    - "Code orchestrates."
    - "Agents think."
  tagline: "Run an agent, own its environment, compose a workflow."
  lead: "Outpost is a TypeScript library for running coding agents inside workflows you write in code. The order, the checks and the resume stay in code; the agent only gets the work that needs judgment."
  install:
    command: "npx @elie-laloum/outpost init"
    copy: "Copy the install command"
    copied: "Copied"
  primary: { label: "Get started", href: "guide/setup/" }
  secondary: { label: "Read the guide", href: "guide/introduction/" }
  facts: "Node.js 24+ · MIT"
  reference: { label: "API reference", href: "reference/" }
  demo:
    title: "One job, two orchestrators"
    pause: "Pause the comparison"
    replay: "Replay the comparison"
    beatsLabel: "Compare"
    beats: ["Steps", "Context", "Order", "Resume"]
    steps: ["Branch", "Fix", "Verify", "Integrate"]
    owners: { model: "model", code: "code", agent: "agent" }
    notes: { early: "too early", reread: "reread", restored: "restored" }
    interrupted: "Interrupted"
    model:
      title: "An LLM orchestrates"
      context: "Model context"
      captions:
        - "The model interprets every step, even the certain ones."
        - "Every step adds to the conversation it rereads."
        - "It decides the order as it goes, and can drift."
        - "After an interruption, it rereads everything."
    code:
      title: "Code orchestrates"
      context: "Agent context"
      captions:
        - "Code branches, verifies and integrates. The agent only fixes."
        - "The agent starts from its brief, nothing more."
        - "The order is a task graph, fixed before the run."
        - "Finished steps come back from the checkpoint."
  problem:
    title: "Models are asked to do everything"
    text: "An LLM is good at judgment: reading code, writing a fix, reviewing a change. Most AI pipelines also hand it the steps, the order and the recovery, which code does better."
    link: { label: "How Outpost works", href: "guide/how-it-works/" }
    answerLabel: "With Outpost"
    groups:
      - title: "Using LLMs today"
        rows:
          - pain: "Everything is interpreted"
            detail: "Even a branch name or a test command goes through the model, every time."
            answer: "Code runs the certain steps. The agent gets only the work that needs judgment."
          - pain: "The context keeps growing"
            detail: "Each step adds to one conversation that the model rereads."
            answer: "Each agent task starts from its own brief, in its own sandbox."
      - title: "Building AI workflows"
        rows:
          - pain: "The orchestrator drifts"
            detail: "When a model decides the order, it can skip, repeat or reorder steps."
            answer: "The task graph is TypeScript, validated before the run. Typed responses are checked against their schema."
          - pain: "Resuming means re-interpreting"
            detail: "After a crash or a quota, the model rebuilds its state from a transcript."
            answer: "Finished tasks come back from the checkpoint as JSON. Rerunning an interrupted one takes your explicit consent."
  workflow:
    title: "Only the fix goes to the agent"
    text: "A plain TypeScript workflow. One task runs an agent in its sandbox; code reads its typed result, waits for a human and resumes from a checkpoint."
    stepsLabel: "Workflow steps"
    copy: "Copy this file"
    steps:
      - {
          title: "One agent task",
          text: "The agent gets a brief, its own sandbox and a named branch. It fixes the tests; it does not decide what runs next.",
          lines: "11-20",
        }
      - {
          title: "Code reads a typed result",
          text: "fix and summary are plain functions. They read the branch and the commit count as values, not as text to interpret.",
          lines: "21-33",
        }
      - {
          title: "A human decides",
          text: "The approval gate pauses the run until an allowed actor approves or rejects the merge.",
          lines: "34-39",
        }
      - {
          title: "Resume without rereading",
          text: "Finished tasks persist as JSON in the checkpoint. Starting again restores them instead of running them again.",
          lines: "41-53",
        }
    link: { label: "Durable runs", href: "guide/durable-runs/" }
  runtimes:
    title: "Any agent, any sandbox"
    text: "Swap either in one line; the workflow stays the same. You declare how each agent authenticates, and an isolated sandbox never falls back to your host."
    agentsLabel: "Agents"
    sandboxesLabel: "Sandboxes"
    experimental: "Experimental"
    agents:
      - { name: "Claude Code", href: "guide/claude-code/" }
      - { name: "Codex", href: "guide/codex/" }
      - { name: "Kimi Code", href: "guide/kimi-code/" }
      - { name: "Copilot CLI", href: "guide/copilot-cli/" }
      - { name: "Antigravity", href: "guide/antigravity/" }
      - { name: "Outpost harness", href: "guide/harness/" }
    sandboxes:
      - { name: "Docker", href: "guide/containers/" }
      - { name: "Podman", href: "guide/containers/#podman" }
      - { name: "Vercel", href: "guide/cloud-sandboxes/#vercel-sandbox" }
      - { name: "Daytona", href: "guide/cloud-sandboxes/#daytona-sandbox" }
      - { name: "Host process", href: "guide/host-process/" }
      - { name: "Firecracker", href: "guide/firecracker/", experimental: true }
    link: { label: "Choose an agent", href: "guide/choose-an-agent/" }
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

Outpost runs coding agents inside workflows you write in TypeScript. Code keeps the order, the checks and the resume; the agent gets the work that needs judgment. Start with the [setup guide](guide/setup/) or look up an API in the [reference](reference/).
