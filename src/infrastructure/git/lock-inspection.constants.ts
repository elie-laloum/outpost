import { constants } from "node:fs";

export const lockInspectionDefaults = {
  maxBytes: 4096,
  maxPid: 2_147_483_647,
  openFlags:
    constants.O_RDONLY |
    (constants.O_NOFOLLOW ?? 0) |
    (constants.O_NONBLOCK ?? 0),
} as const;
