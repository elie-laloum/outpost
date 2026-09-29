---
title: "Errors — Overview"
description: "Errors communicate why an Outpost operation failed and what information remains available."
sidebar:
  label: Overview
  order: 0
---

Errors communicate why an Outpost operation failed and what information remains available. A domain fault code supports programmatic handling; the message explains the immediate problem; recovery details locate retained work when the failure produced recoverable state.

## How it works

Use `OutpostError` and `FaultCode` to recognize documented failures without parsing prose. `recoveryDetails` extracts supported recovery information from an error. `quotaFault` recognizes usage and rate limits, including wrapped ones, and returns the reported reset time. `unavailableFault` recognizes terminal agent or model service outages, which keep their original `process` or `provider` code. Keep operation failure, a nonzero command result and a failed workflow task distinct: their owning contracts expose outcomes differently.

## Boundaries and responsibilities

Do not retry blindly after a failure with side effects. Inspect retained state and determine whether another attempt is safe. Not every thrown value is an Outpost error, and not every failure has recovery artifacts. Cleanup must preserve evidence rather than hide the original problem.

## Entry points

- [OutpostError](../../outposterror/)
- [FaultCode](../../faultcode/)
- [recoveryDetails](../../recoverydetails/)
- [quotaFault](../../quotafault/)
- [unavailableFault](../../unavailablefault/)

[Learn with the practical guide](../../../guide/operations/recovery/).
