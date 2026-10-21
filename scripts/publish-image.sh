#!/usr/bin/env bash
set -euo pipefail

retry_registry() {
  local attempt status
  for attempt in 1 2 3; do
    if "$@"; then
      return 0
    else
      status=$?
    fi
    if (( attempt == 3 )); then
      return "$status"
    fi
    echo "::warning::Registry command failed on attempt $attempt/3; retrying the same image bytes." >&2
    sleep "$((attempt * 5))"
  done
}

image="ghcr.io/${REPOSITORY,,}/$NAME"
version=$(node -p 'require("./package.json").version')
run="sha-${GITHUB_SHA}-${GITHUB_RUN_ID}-${GITHUB_RUN_ATTEMPT}"
for arch in amd64 arm64; do
  docker load -i "$RUNNER_TEMP/image-$NAME-$arch/image.tar"
  docker tag "outpost-$NAME:ci" "$image:$run-$arch"
  retry_registry docker push "$image:$run-$arch"
done
retry_registry docker buildx imagetools create -t "$image:$run" -t "$image:$version" "$image:$run-amd64" "$image:$run-arm64"
digest=$(docker buildx imagetools inspect "$image:$run" --format '{{.Manifest.Digest}}')
[[ "$digest" =~ ^sha256:[a-f0-9]{64}$ ]]
echo "image=$image" >> "$GITHUB_OUTPUT"
echo "digest=$digest" >> "$GITHUB_OUTPUT"
