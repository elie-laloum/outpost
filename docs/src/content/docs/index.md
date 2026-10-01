---
title: Outpost
description: "Run coding agents from your TypeScript. Claude Code, Codex, Copilot CLI and Kimi Code in a sandbox you own, on a Git branch you control."
landing:
  headline:
    - "Run coding agents"
    - "from your TypeScript."
  tagline: "Run an agent, own its environment, compose a workflow."
  lead: "Claude Code, Codex, Copilot CLI and Kimi Code, in a Docker, Podman or cloud sandbox you own, on a Git branch you control. Your code keeps the order, the checks and the resume; the agent gets only the work that needs judgment."
  hero:
    caption: "One task from end to end: a sandbox, a named branch, the agent’s answer and its commits."
  install:
    command: "npx @elie-laloum/outpost init"
    copy: "Copy the install command"
    copied: "Copied"
    prerequisites: "You need Node.js 24+, a Git repository with at least one commit, Docker or Podman running, and your agent CLI signed in."
    outcome: "It writes run.ts, brief.md, a Dockerfile and your configuration, then builds the agent image. Then run:"
    next: 'node run.ts "Describe this repository"'
  primary: { label: "Get started", href: "guide/setup/" }
  secondary: { label: "Read the guide", href: "guide/introduction/" }
  facts: "MIT"
  evidence:
    - "CI on Windows, macOS and Linux"
    - "Real Docker and Podman tests"
    - "80% coverage gate"
    - "npm publish with provenance"
  reference: { label: "API reference", href: "reference/" }
  useCases:
    title: "What you can run"
    text: "Each one is a guide page: the code, the contracts it uses and what comes back."
    link: { label: "Your first task", href: "guide/first-request/" }
    entries:
      - title: "Fix a failing CI build"
        text: "An agent fixes the tests on a branch while Outpost reruns them after each attempt and feeds the failures back."
        href: "guide/fix-failing-ci/"
      - title: "Review a pull request on demand"
        text: "A label on a pull request queues an agent review, and your code posts the typed verdict it returns."
        href: "guide/review-on-label/"
      - title: "Nightly maintenance"
        text: "Every weekday night, an agent updates dependencies on a dated branch and leaves a typed report for the morning."
        href: "guide/nightly-maintenance/"
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
  determinism:
    title: "Probabilistic in one place. Deterministic everywhere else."
    text: "Run the same workflow again: the order, the branch, the checks and the integration are identical every time. Only the agent’s work varies, and nothing uses it until a check accepts it. Outpost does not make the model deterministic; it keeps everything else out of its hands."
    link: { label: "Verification loops", href: "guide/verification-loops/" }
    replayLink:
      { label: "Replay without a model", href: "guide/record-replay/" }
    check: "The check is plain code: the tests decide, not the model."
    demo:
      title: "The same workflow, run again"
      run: "Run"
      rerun: "Run again"
      replay: "Replay the recording"
      calls: "Replay · 0 model calls"
      columns: ["Branch", "Agent", "Verify", "Integrate"]
      owners: { code: "code", agent: "agent" }
      same: "same each run"
      varies: "varies each run"
      replayed: "same, replayed"
      captions:
        live: "Only the agent column changes. Nothing is integrated until the tests pass."
        replay: "Replayed from a recording: the agent’s answer comes back identical, without calling a model."
      file: "file"
      files: "files"
      retry: "2nd try"
      replayedNote: "replayed"
      failed: "failed"
      merged: "merged"
      announce: "Run {run}: tests pass, branch merged."
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
  boundaries:
    title: "Where Outpost is not the answer"
    text: "Outpost owns the steps around an agent. When those steps are not yours to own, something smaller is the better choice."
    entries:
      - lead: "One agent session is enough"
        text: "If the whole job fits in one conversation, run the agent CLI directly. Outpost earns its place when the branch, the checks, the order and the resume are yours."
      - lead: "A single CI step"
        text: "A workflow file that runs an agent and stops is less code. Outpost runs the same job from CI, a queue, a cron slot or a verified webhook, and keeps the checkpoint when the worker restarts."
      - lead: "An LLM pipeline"
        text: "Outpost does not chain prompts and has no vector store or retrieval layer. It runs coding agents against Git repositories; the model calls it makes itself go through its own harness."
    link: { label: "Job queues and workers", href: "guide/job-queues/" }
    action: { label: "Start with the setup guide", href: "guide/setup/" }
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

Outpost runs coding agents in a sandbox you own, from workflows you write in TypeScript. Code keeps the order, the checks and the resume; the agent gets the work that needs judgment. Start with the [setup guide](guide/setup/) or look up an API in the [reference](reference/).
