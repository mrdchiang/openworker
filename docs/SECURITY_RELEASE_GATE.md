# Vision Beta security release gate

This project is an internal prototype. A green pipeline does not make the
desktop app production-ready; it records the checks that must be completed
before a MACOM release.

## Every merge request

- GitLab SAST, secret detection, and dependency scanning complete without an
  unreviewed high or critical finding.
- Python, frontend, and Rust lockfiles are present and changes are reviewed.
- Tests cover approval-gated MCP calls and reject invalid Okta configuration.
- No real Jira, Microsoft 365, GitHub, Okta, or cloud credentials are stored
  in the repository or demo fixtures.

## Before internal pilot

- Require authenticated Okta sessions server-side; the current Okta page is
  configuration-only and deliberately reports `authentication_active: false`.
- Enforce an allowlist of curated MCP servers and tools. Custom server support
  must remain administrator-only and fail closed.
- Keep write and destructive tools approval-gated, with durable audit events
  containing actor, model, tool, approval decision, and result status.
- Verify state files are private to the signed-in Windows user and redact
  credentials from logs, exports, and error messages.
- Sign the MSI and publish a MACOM-controlled, signed update manifest before
  enabling updates. The prototype updater is disabled to prevent upstream
  replacement of MACOM customizations.

## Demo data

The Vision demo MCP server is offline and uses fictional Jira, engineering,
inventory, Microsoft 365, and GitHub records. It must never be connected to
production systems or presented as evidence of a live integration.
