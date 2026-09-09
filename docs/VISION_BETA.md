# Vision Beta by MACOM

Internal pitch prototype owned by an information security engineer. Develop from this checkout and run the application separately. Branch: `codex/vision-beta`.

## Start the baseline on Windows

From the repository root, run these commands in separate PowerShell terminals, server first:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/vision-dev.ps1 server
powershell.exe -NoProfile -ExecutionPolicy Bypass -File scripts/vision-dev.ps1 ui
```

Open http://127.0.0.1:1420. Stop each process with Ctrl+C. Restart the UI after restarting the server so it reads the new launch token. Ports 8765 and 1420 must be free.

The execution-policy option applies only to these launcher processes; it does not change the machine's saved PowerShell policy.

The launcher uses `%LOCALAPPDATA%/MACOM/VisionBeta/dev-state` for settings and credentials and a separate `demo-workspace` beside it for task files. These are outside the source checkout and OneDrive. Existing Openworker settings are not imported. The baseline defaults to `ollama:qwen3:latest`; enter DeepSeek credentials through application settings, never source files.

## Agreed implementation scope

- MACOM appearance and Vision Beta by MACOM identity.
- Ollama and DeepSeek first; retain existing Bedrock integration for later validation.
- Employee, administrator, and developer customization.
- Harness controls for instructions, context/memory, tools, delegation, approvals, and long-running tasks.
- MACOM-curated MCP Tool Catalog; arbitrary server registration is an administrator capability in the intended design.
- One working catalog demonstration using clearly labeled sample engineering documents.
- Okta OIDC configuration page only. Saved configuration and role previews must not claim active authentication or authorization enforcement.
- Repeatable pitch workflow: choose a model, inspect an approved integration, complete a task, inspect the activity.

## Baseline findings

The inherited source includes Ollama, DeepSeek, and Bedrock adapters, provider setup UI, custom MCP connections, and execution controls. Existing code is a starting point; presence does not establish runtime correctness or enterprise readiness.

Local Ollama discovery on September 9, 2026 returned `qwen3:latest`, `qwen2.5:14b`, and `nomic-embed-text:latest` (embedding model).

Baseline checks passed: production frontend build, all 181 frontend unit tests across 25 files, and 97 targeted backend provider/router/verification/settings tests. The build reports inherited bundle-size and mixed-import warnings. This is not a full backend-suite or packaged-desktop validation.

Live smoke test passed: browser UI connected to the isolated backend, selected `qwen3:latest`, and received `Vision ready.` through the application chat. DeepSeek has not been validated with a live credential. Tool execution has not yet been smoke-tested.

## First feature pass

- Branded browser title, sidebar, welcome prompts, color palette, and bundled public MACOM logo. See `VISION_BRANDING.md` for provenance.
- Searchable, category-filtered Tool Catalog: Jira, Microsoft 365, engineering knowledge, GitHub, and internal inventory. Cards expose proposed capabilities, setup requirements, and fictional sample records.
- A working local MCP server with seven invented records and two read-only tools. Click **Enable demo tools** in Tool Catalog, then start a new chat. Connection testing verifies the MCP transport; it does not establish model task reliability.
- Identity / Okta settings stored using the existing private state-file writer. HTTPS issuer and redirect validation, proposed group mappings, and an explicit inactive-authentication status. No client secret collection, OAuth callback, or role enforcement.
- Inherited connection administration remains available, clearly labeled as an owner-operated prototype. Catalog-only restrictions are not yet enforced at the backend.

Verification: production build, 181 inherited frontend unit tests plus 2 new catalog tests, 10 new backend tests (including real MCP stdio execution, rejected identity fields, and sidecar token enforcement). Identity settings were saved through the browser; the catalog's real connection test discovered both tools.

Not yet delivered: live enterprise connections or enforced employee/admin roles. The Windows packaging recipe is now branded for Vision Beta by MACOM; producing the MSI requires a clean PyInstaller sidecar build and a full Tauri build, which is the next step.
