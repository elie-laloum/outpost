---
title: "Choose compatible capabilities"
description: "Agent and provider capabilities are independent."
---

| Agent                             | Fresh run | Native capture, resume and fork | Response repair | Authentication forms             | In generated image |
| --------------------------------- | --------- | ------------------------------- | --------------- | -------------------------------- | ------------------ |
| Claude Code                       | Yes       | Yes                             | Yes             | `account` (file, token), `usage` | Yes                |
| Codex                             | Yes       | Yes                             | Yes             | `account` (file), `usage`        | Yes                |
| Antigravity CLI (`agy`)           | Yes       | No                              | No              | `account` (file), `usage`        | Yes, unpinned      |
| GitHub Copilot CLI                | Yes       | No                              | No              | `account` (file, token)          | Yes                |
| Kimi Code                         | Yes       | No                              | No              | `account` (profile), `usage`     | Yes                |
| Custom `harness()` (experimental) | Yes       | Yes, Outpost transcript         | Yes             | Model provider API key           | Not applicable     |

| Provider        | Environment                | Interactive terminal | Git mode                  |
| --------------- | -------------------------- | -------------------- | ------------------------- |
| Docker / Podman | Local container            | Yes                  | Current, named, integrate |
| Local           | Host process, no isolation | Yes                  | Current, named, integrate |
| Vercel          | Remote sandbox             | No                   | Named, integrate          |
| Daytona         | Remote sandbox             | Yes, native PTY      | Named, integrate          |
| Firecracker     | Research microVM           | See prototype limits | See prototype limits      |

[Choose a provider](../../environment/providers/overview/) or consult [exact provider limits](../../behavior/providers/overview/). Custom Codex endpoints require Responses API compatibility. Antigravity, Copilot and Kimi run fresh sessions only; they do not inherit Claude/Codex conversation support. See [authentication](../authentication/) for each form and [CLI agent harnesses](../../behavior/agents/adapters/) for per-CLI settings. Opt-in isolation, egress and speculative execution have explicitly documented research limits.
