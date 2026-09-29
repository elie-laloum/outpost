import { posix } from "node:path";
import { quote } from "../../../infrastructure/process.ts";
import { antigravityReleases } from "./antigravity-install.constants.ts";
import type { AntigravityRelease } from "./antigravity-install.types.ts";

export function antigravityInstall(
  target: string,
  releases: Readonly<Record<string, AntigravityRelease>> = antigravityReleases,
): string {
  const platforms = Object.entries(releases).map(
    ([platform, release]) =>
      `${platform}) url=${quote(release.url)}; digest=${quote(release.sha512)} ;;`,
  );
  const script = [
    "set -eu",
    'case "$(uname -s)" in Linux) os=linux ;; Darwin) os=darwin ;; *) echo "Unsupported Antigravity operating system" >&2; exit 1 ;; esac',
    'case "$(uname -m)" in x86_64|amd64) arch=amd64 ;; aarch64|arm64) arch=arm64 ;; *) echo "Unsupported Antigravity architecture" >&2; exit 1 ;; esac',
    'platform="${os}_${arch}"',
    'if [ "$os" = linux ] && { [ -f /lib/libc.musl-x86_64.so.1 ] || [ -f /lib/libc.musl-aarch64.so.1 ] || ldd /bin/ls 2>&1 | grep -q musl; }; then platform="${platform}_musl"; fi',
    `case "$platform" in ${platforms.join(" ")} *) echo "Unsupported Antigravity platform: $platform" >&2; exit 1 ;; esac`,
    `mkdir -p ${quote(posix.dirname(target))}`,
    `staging=$(mktemp -d ${quote(posix.join(posix.dirname(target), ".agy-XXXXXXXX"))})`,
    `trap 'rm -rf "$staging"' EXIT`,
    "trap 'exit 130' INT",
    "trap 'exit 143' TERM",
    'curl --fail --silent --show-error --location --connect-timeout 30 --max-time 300 "$url" -o "$staging/agy.tar.gz"',
    'case "$os" in darwin) actual=$(shasum -a 512 "$staging/agy.tar.gz") ;; *) actual=$(sha512sum "$staging/agy.tar.gz") ;; esac',
    'if [ "${actual%% *}" != "$digest" ]; then echo "Antigravity SHA-512 checksum mismatch; installation aborted" >&2; exit 1; fi',
    'tar -xzf "$staging/agy.tar.gz" -C "$staging" antigravity',
    'if [ ! -f "$staging/antigravity" ] || [ -L "$staging/antigravity" ]; then echo "Invalid Antigravity archive binary" >&2; exit 1; fi',
    'chmod 0755 "$staging/antigravity"',
    `mv -f "$staging/antigravity" ${quote(target)}`,
  ].join("; ");
  // A separate shell preserves errexit even inside bootstrap's && expression.
  return `sh -c ${quote(script)}`;
}
