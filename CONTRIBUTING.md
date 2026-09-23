# Contributing

Use Node.js 24+, Git and npm. Run `npm ci`, then `npm run check`. Changes to execution, cancellation, Git handling or transfers need functional tests that cover outcomes and recovery, not only mocked calls. Run `npm run coverage` and keep the line/function/branch gates at 80% or higher. Use `npm run format` before committing.

Keep domain contracts independent from concrete provider SDKs. Add adapters through the public ports; do not add provider-specific branches to workflow tasks. Keep comments rare and at most two lines. Explain non-obvious design choices in documentation and tests.

GitLab is authoritative and GitHub is a mirror. Submit or integrate changes on GitLab, then wait for mirrored GitHub CI. Release tags also originate on GitLab. Never put credentials, logs, transcripts, recovery bundles or generated dependency directories in commits.
