import type { AntigravityRelease } from "./antigravity-install.types.ts";

// URLs and SHA-512 digests captured from Google's platform manifests for CLI 1.2.12.
export const antigravityReleases: Readonly<Record<string, AntigravityRelease>> =
  Object.freeze({
    linux_amd64: {
      url: "https://storage.googleapis.com/antigravity-public/antigravity-cli/1.2.12-5784551402897408/linux-x64/cli_linux_x64.tar.gz",
      sha512:
        "d5f0fe7433cb7c43ea878c07627a4fdb82d218f3bef5e6436266f5d9fdd2df145523453b9be0c4250391a64a007f5f42f7faff797bc2b2d502e7efb4874e383a",
    },
    linux_arm64: {
      url: "https://storage.googleapis.com/antigravity-public/antigravity-cli/1.2.12-5784551402897408/linux-arm/cli_linux_arm64.tar.gz",
      sha512:
        "e2f10960197efbf2455edb1284ae686821e244908367f507bcb6a0d0f616e945d3eec5cdf29b41bbcd7f630826d0e9e233f457184d1696fa91e81d6a7ed440c9",
    },
    linux_amd64_musl: {
      url: "https://storage.googleapis.com/antigravity-public/antigravity-cli/1.2.12-5784551402897408/linux-x64-musl/cli_linux_x64_musl.tar.gz",
      sha512:
        "830f4de12f9b79ec0a1ab4ce4b791d77d779517293c5a457990d351df3efde5ced750d2102ff59559c195b885bbc0f84404fdcf3d475315761d0fffe9217292f",
    },
    linux_arm64_musl: {
      url: "https://storage.googleapis.com/antigravity-public/antigravity-cli/1.2.12-5784551402897408/linux-arm-musl/cli_linux_arm64_musl.tar.gz",
      sha512:
        "5035f56c8f6c4d672ecaf1b45edddb43617205b36a8787bac12bdc6042992d89ec6afcada9fa1174696ff3f78c1b7155c68e97e3c2bdd59b8bb13bc60a0f87e5",
    },
    darwin_amd64: {
      url: "https://storage.googleapis.com/antigravity-public/antigravity-cli/1.2.12-5784551402897408/darwin-x64/cli_mac_x64.tar.gz",
      sha512:
        "07e56833460bc8999ea44f7fc4cff795e0304a08a05e5e296d6096ac8e1ef15c95aee6b692803734bb7f488e416c8bc80be640dfa7089d927fe79dbefdb56d21",
    },
    darwin_arm64: {
      url: "https://storage.googleapis.com/antigravity-public/antigravity-cli/1.2.12-5784551402897408/darwin-arm/cli_mac_arm64.tar.gz",
      sha512:
        "92bcd4d1976b570d6f053a1b5716e2f2962c22ca3cf7657a3fcb66b05b0f5523fa2d6f1899f157c09b66abda2c2f81938101ad7cd31845e1eda8f277addc2b8e",
    },
  });
