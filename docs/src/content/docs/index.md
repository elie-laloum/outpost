---
title: Outpost — Agent workflows in TypeScript and YAML
description: Connect agents, tools and human decisions into workflows for email, research, documents, software and the work you want to automate.
tableOfContents: false
head:
  - tag: title
    content: Outpost — Agent workflows in TypeScript and YAML
  - tag: meta
    attrs:
      property: og:type
      content: website
landing:
  category: Agent orchestration · TypeScript library & CLI
  headline:
    - Your agents.
    - Your tools. Your workflows.
  lead: Connect agents, actions and decisions to automate your work. Define what happens next, what needs a check and when you want to step in.
  primary:
    label: Explore the possibilities
    href: "#possibilities"
  secondary:
    label: Start with the Guide
    href: guide/introduction/
  scenarios:
    label: Imagine your next workflow
    title: What would you like to put to work?
    text: A new message. A folder of documents. A request from a customer. Start with work you recognize, then shape the steps around your needs.
    requestLabel: The request
    resultLabel: What you get
    note: These are workflows you can compose. You connect your services through your own code, APIs or MCP tools; Outpost orchestrates the steps, agents and pauses.
    items:
      - id: mail
        label: Email
        icon: message
        title: An inbox that helps you decide what matters.
        request: “Sort the new messages and prepare replies to the ones that need me.”
        steps:
          - title: Read new messages
            text: Your mail API provides the messages to process.
            role: Your tools
            icon: plug
            mechanisms:
              - label: Custom tasks
                href: guide/task-dependencies/
          - title: Classify the message
            text: A typed decision classifies the message, scores its priority and determines whether a reply is needed.
            role: Decision
            icon: split
            mechanisms:
              - label: Typed decisions · System One
                href: guide/decisions/
          - title: Prepare the replies
            text: Draft responses using the context you choose to supply.
            role: Agent
            icon: message
            mechanisms:
              - label: Briefs and context
                href: guide/briefs/
          - title: Approve before sending
            text: Pause for your decision. Only approved replies reach your sending action.
            role: You
            icon: approve
            mechanisms:
              - label: Human approvals
                href: guide/approvals/
        result: Messages grouped by priority and drafts ready for your approval.
        boundary: You choose the mailbox access and the action that sends a reply.
      - id: research
        label: Research
        icon: search
        title: Keep up with the subjects that matter to you.
        request: “Every Monday, tell me what changed in the sources I follow.”
        steps:
          - title: Collect the sources
            text: A scheduled job starts the collection through your tools.
            role: Your tools
            icon: clock
            mechanisms:
              - label: Scheduling
                href: guide/cron-schedules/
          - title: Read in parallel
            text: Independent agent tasks extract the relevant changes.
            role: Agents
            icon: split
            mechanisms:
              - label: Parallel tasks
                href: guide/concurrency-and-retries/
          - title: Bring the findings together
            text: Group related stories and keep references to their sources.
            role: Agent
            icon: layers
            mechanisms:
              - label: Task dependencies
                href: guide/task-dependencies/
          - title: Deliver the briefing
            text: Your publishing action saves or delivers the finished report.
            role: Your tools
            icon: file
            mechanisms:
              - label: Custom tasks
                href: guide/task-dependencies/
        result: A recurring briefing with the changes and source references in one place.
        boundary: You supply the sources, collection tools and delivery destination.
      - id: documents
        label: Documents
        icon: file
        title: Turn a pile of documents into usable information.
        request: “Extract the important fields and flag anything that needs a second look.”
        steps:
          - title: Read the files
            text: Give the task a folder, including one outside a Git repository.
            role: Your files
            icon: folder
            mechanisms:
              - label: File workspaces
                href: guide/working-with-files/
          - title: Extract the information
            text: An agent returns the fields in the structure you declare.
            role: Agent
            icon: agent
            mechanisms:
              - label: Structured responses
                href: guide/typed-responses/
          - title: Check the values
            text: Your code validates the data and identifies missing information.
            role: Your rules
            icon: braces
            mechanisms:
              - label: Response validation
                href: guide/typed-responses/
          - title: Resolve the exceptions
            text: Ask a person about ambiguous cases before exporting accepted records.
            role: You
            icon: approve
            mechanisms:
              - label: Human dialogue
                href: guide/interactive-tasks/
        result: Structured records you can use, with ambiguous cases set aside for review.
        boundary: You provide any file conversion tools and define the checks that make a record acceptable.
      - id: support
        label: Customer requests
        icon: users
        title: Give each request a useful next step.
        request: “Find the context, qualify the request and send it to the right team.”
        steps:
          - title: Receive the request
            text: Your application submits a job from a verified event.
            role: Your tools
            icon: queue
            mechanisms:
              - label: Webhooks
                href: guide/webhooks/
          - title: Find the context
            text: The agent finds customer and product information through the MCP tools you connect.
            role: Agent + tools
            icon: search
            mechanisms:
              - label: MCP tools
                href: guide/mcp-servers/
          - title: Choose the next step
            text: A typed decision selects a category using your criteria.
            role: Decision
            icon: split
            mechanisms:
              - label: Typed decisions · System One
                href: guide/decisions/
          - title: Route or ask
            text: Your code assigns the request, or pauses for a person to clarify it.
            role: Your rules
            icon: users
            mechanisms:
              - label: Task conditions
                href: guide/concurrency-and-retries/
              - label: Human dialogue
                href: guide/interactive-tasks/
        result: A qualified request with context, ready for the appropriate team.
        boundary: You connect the help desk or CRM and decide which actions may run automatically.
      - id: software
        label: Software
        icon: branch
        title: Take a change from request to review.
        request: “Implement this change, run the tests and keep the result for review.”
        steps:
          - title: Plan the change
            text: An agent proposes the work and can ask for your approval.
            role: Agent + you
            icon: message
            mechanisms:
              - label: Human approvals
                href: guide/approvals/
          - title: Make the change
            text: The agent works in the workspace and sandbox you choose.
            role: Agent
            icon: agent
            mechanisms:
              - label: Sandboxes
                href: guide/choose-a-sandbox/
              - label: Git workspaces
                href: guide/git-workspaces/
          - title: Run your checks
            text: Feed failures into a bounded correction loop; stop when attempts run out.
            role: Your rules
            icon: ci
            mechanisms:
              - label: Correction loops
                href: guide/verification-loops/
          - title: Review the result
            text: Inspect the retained branch and decide whether to integrate it.
            role: You
            icon: branch
            mechanisms:
              - label: Branch policies
                href: guide/git-workspaces/
        result: A branch with the proposed changes and the results of your checks.
        boundary: You choose the tests, retry limits and integration policy.
  overview:
    - icon: plug
      title: Bring the tools you already use
      text: Connect your functions, APIs and MCP servers. Let agents work with the context and actions your task needs.
    - icon: nodes
      title: Give every step a clear next move
      text: Pass results between tasks, run independent work in parallel and choose the next action from the outcome.
    - icon: approve
      title: Keep the decisions that matter
      text: Require a check or a human answer before continuing. Choose where automation ends and your judgment begins.
  capabilities:
    title: The building blocks for your own ideas
    text: Combine these behaviors around your work. Start with a single task and add the pieces that make the next step useful.
    items:
      - icon: split
        title: Let several tasks make progress
        text: Read different sources or process independent requests in parallel, then bring their results together.
      - icon: braces
        title: Turn answers into usable data
        text: Validate a structured answer before your code uses it to decide or act.
      - icon: repeat
        title: Check, correct, try again
        text: Give failed checks back to an agent, with a limit on how many attempts it can make.
      - icon: pause
        title: Make room for a person
        text: Pause for an approval or a missing detail, then continue with the accepted answer.
      - icon: replay
        title: Pick up work later
        text: Save completed steps and resume a durable workflow. Recover interrupted attempts explicitly.
      - icon: clock
        title: Run when the work arrives
        text: Publish jobs from a schedule or verified webhook, and let workers execute them with the budgets you set.
  closing:
    title: What will your first workflow do?
    text: Choose one task you would like to hand off. The Guide introduces the pieces and helps you connect them to your own work.
    link:
      label: Start with the Guide
      href: guide/introduction/
  install:
    managers: Package manager
    commands:
      - label: npm
        command: npm install @elie-laloum/outpost
      - label: yarn
        command: yarn add @elie-laloum/outpost
      - label: bun
        command: bun add @elie-laloum/outpost
      - label: pnpm
        command: pnpm add @elie-laloum/outpost
    copy: Copy the install command
    copied: Copied
    failed: Copy failed. Select the command to copy it.
    prerequisites: Node.js 24+ · Your agents, tools and execution environment
  footer:
    documentation:
      title: Documentation
      links:
        - label: Guide
          href: guide/introduction/
        - label: API
          href: reference/
    source:
      title: Project
      links:
        - label: GitLab
          href: https://gitlab.elielaloum.com/elielaloum/outpost
        - label: GitHub
          href: https://github.com/elie-laloum/outpost
        - label: npm
          href: https://www.npmjs.com/package/@elie-laloum/outpost
    license: MIT license
---

<span id="one-task-now-a-workflow-when-you-need-it"></span>
<span id="deliver-a-csv-export-from-ticket-to-branch"></span>
<span id="start-with-work-already-on-your-plate"></span>
<span id="keep-your-tools-choose-how-they-work-together"></span>

## Your process can take more than one path

An agent can interpret a request. Your tools fetch context and perform actions. Your code checks the result, chooses what follows or asks a person to decide. Outpost connects those steps and keeps track of their execution.

This is one possible path. You decide which checks and pauses your work needs.

<!-- canvas -->

- **New input**: A message, a document, a scheduled job or a request from your application.
  - Your tools
  - → **Understand**: context ready
- **Understand**: An agent analyzes the input and returns a structured proposal.
  - Agent
  - → **Check**: proposal ready
- **Check**: Your rules validate the result and decide whether someone needs to review it.
  - Your code
  - → **Act**: accepted
  - → **Ask a person**: judgment needed
- **Ask a person**: Save the question and wait for an accepted answer before continuing.
  - You
  - → **Act**: approved
- **Act**: Your function saves the result, updates a service or starts the next task.
  - Your tools

## Choose how your agents work

Use a CLI agent such as Claude Code, Codex, Copilot, Kimi or Antigravity, or build an agent loop with a model provider and your own tools. Choose the execution environment separately: a container, a cloud sandbox or explicit local execution.

Compose the workflow in TypeScript or declare it in YAML. Work with repositories, ordinary folders or temporary files. Keep your existing services and connect the actions your workflow needs.
