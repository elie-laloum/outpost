export const browserLaunchers = {
  darwin: [{ command: "open", arguments: [] }],
  win32: [{ command: "rundll32", arguments: ["url.dll,FileProtocolHandler"] }],
  // WSL first tries the Windows browser through wslu, then a Linux one.
  linux: [
    { command: "wslview", arguments: [] },
    { command: "xdg-open", arguments: [] },
  ],
} as const;
