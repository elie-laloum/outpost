---
title: "Choose compatible capabilities"
description: "Agent and provider capabilities are independent."
---

| Agent       | Fresh run | Native capture, resume and fork | Response repair |
| ----------- | --------- | ------------------------------- | --------------- |
| Claude Code | Yes       | Yes                             | Yes             |
| Codex       | Yes       | Yes                             | Yes             |
| Gemini CLI  | Yes       | No                              | No              |

| Provider        | Environment                | Interactive terminal | Git mode                  |
| --------------- | -------------------------- | -------------------- | ------------------------- |
| Docker / Podman | Local container            | Yes                  | Current, named, integrate |
| Local           | Host process, no isolation | Yes                  | Current, named, integrate |
| Vercel          | Remote sandbox             | No                   | Named, integrate          |
| Daytona         | Remote sandbox             | Yes, native PTY      | Named, integrate          |
| Firecracker     | Research microVM           | See prototype limits | See prototype limits      |

[Choose a provider](../../../guide/environment/providers/overview/) or consult [exact provider limits](../../behavior/providers/overview/). Custom Codex endpoints require Responses API compatibility. Gemini does not inherit Claude/Codex conversation support. Opt-in isolation, egress and speculative execution have explicitly documented research limits.
