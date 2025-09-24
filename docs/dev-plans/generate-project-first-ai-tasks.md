Generate First Tasks with AI (FE-PR-005)

References

- Backend usage guide — [spec: project-management-api/docs/dev-plans/pr-005-task-generator-usage.md]
- MCP operational spec — [spec: project-management-api/docs/dev-plans/operational-mcp-integration-spec.md]
- Screen context: Project Details → Tasks empty state (see current UI)

Summary & Scope

- Add an AI-powered flow to generate the first 3–12 tasks for a project when the Tasks section is empty, with secondary entry points for discoverability.
- In scope: modal UX, prompt composer, loading state, review & select, import, error handling, i18n, telemetry, UI feature flag.
- Out of scope: dependencies/estimates editing, subtasks, vector retrieval, file uploads.

Assumptions & Constraints

- API endpoint available: POST `/ai/generate-tasks` (JWT-auth, feature-flagged by `AI_TOOLS_ENABLED`).
- Latency budget ≤ 3s p95; show progress UI and allow retry.
- Respect permissions: only users who can create tasks see primary CTA.
- Locale follows app i18n and is sent to API.

Open Questions (Blocking)

- [x] Default imported task status → `TODO` (decision)
- [x] Default slider count → `6` (decision)
- [x] Editing in P1 → Read-only preview with Accept/Reject; full edit deferred to P2 (decision)
- [x] Undo after import → Descoped for P1 (decision)

Incremental Plan

Phase 0 — Foundations

- [x] Add UI feature flag `ai_generate_tasks_ui` (mirrors backend flag; hides CTAs when off) [spec: AI_TOOLS_ENABLED]
- [x] Define FE DTOs that mirror API response (strict TS) [spec]
- [x] Seed i18n keys (EN/FR) for modal, CTAs, errors
- [ ] Telemetry: descoped in P1; rely on backend metrics (`ai.taskgen.request/error/latency`) [spec]

Phase 1 — Entry Points

- [ ] Replace Tasks empty state with two CTAs: `Generate with AI` (primary), `Create manually` (secondary)
- [x] Add header kebab item `Generate tasks…`
- [ ] Add `+ New` split-button dropdown `Generate with AI…`

Phase 2 — Modal: Prompt & Options

- [x] Modal shell `Generate first tasks`
- [x] Prefill prompt from `project.name` + `project.description` (editable textarea)
- [x] Options: task count 3–12 (slider, default 6), project type select, priority default (Auto/Low/Medium/High), locale (read-only)
- [x] Validate non-empty prompt; enable Generate

Phase 3 — Call & Loading State

- [x] POST `/ai/generate-tasks` with `{ prompt, projectId, locale }` [spec]
- [x] Disable inputs; show progress; allow cancel/close
- [x] If `meta.degraded === true`, show inline info banner

Phase 4 — Review & Select

- [ ] Render results list: title, description, suggested priority (read-only)
- [ ] `Select all` default; per-item checkbox; Accept/Reject selection only (no edits in P1)
- [ ] Actions: `Add selected tasks` (primary), `Regenerate`, `Back to prompt`

Phase 5 — Import & Confirmation

- [ ] Batch-create tasks via existing task service
- [ ] Toast `N tasks added`
- [ ] Brief highlight on inserted rows

Phase 6 — Errors, Limits, Guardrails

- [ ] Map 503 `AI tools are disabled` → CTA disabled + tooltip
- [ ] Rate limit/cooldown messaging on CTA when applicable
- [x] Preserve user input across failures; `Try again` action

API/Schema & Types Impact

- Request: `{ prompt: string; projectId?: string; locale?: string }`
- Response: `{ tasks: Array<{ title: string; description?: string; priority?: 'LOW'|'MEDIUM'|'HIGH' }>; meta?: { model?: string; provider?: string; degraded?: boolean } }`
- FE maps priority to app enum; default task status set to `TODO` on import.

UX Acceptance Criteria & Test Plan

- [ ] Given empty Tasks, when `Generate with AI` clicked, modal opens with prefilled prompt.
- [ ] When submitting, loading state appears until results or error.
- [ ] When results arrive, user can select/deselect and import selected (no editing in P1).
- [ ] On import, tasks appear in list and toast confirms.
- [ ] Imported tasks default to status `TODO`.
- [ ] If degraded mode, info banner is visible in modal.
- [ ] If feature disabled or no permission, CTA hidden/disabled with explanatory tooltip.
- [ ] A11y: focus trap, keyboard navigation, ARIA labels, contrast.
- [ ] Tests: unit for modal state machine; e2e for happy path and error.

Risks & Mitigations

- Latency variance → visible progress + retry; keep inputs intact.
- Low-signal generations → review step acts as quality gate; easy deselect.
- Permission mismatches → reuse existing capability checks; defensive UI.

Rollout & Feature Flags

- Gate UI via `ai_generate_tasks_ui`; progressive rollout (internal → beta → all).
- Metrics dashboard for open/generate/import/error rates.

Definition of Done

- [ ] All acceptance criteria pass locally and in CI
- [ ] Copy/i18n reviewed
- [ ] Telemetry verified in staging
- [ ] Rollout checklist executed and documented

Changelog

- 2025-09-24: Initial draft created from PR-005 backend specs.

FE Resources & Touchpoints (P1)

New resources to add

- `src/types/ai.ts`
  - `GenerateTasksRequest`, `GeneratedTask`, `GenerateTasksResponse` (mirror backend usage guide)
- `src/services/ai.ts`
  - `AiService.generateTasks(payload: GenerateTasksRequest): Promise<GenerateTasksResponse>` → `apiClient.post('/ai/generate-tasks')`
- `src/hooks/useAi.ts`
  - `useGenerateTasks()` React Query mutation
- `src/lib/features.ts`
  - `isAiTaskGenEnabled(): boolean` → `import.meta.env.VITE_FEATURE_AI_TASKGEN === 'true'`
- `src/components/projects/GenerateAiTasksModal.tsx`
  - Prompt + options (count slider default 6, project type, priority Auto)
  - Loading, then read-only Review (accept/reject), then Import callback
- `src/components/projects/buttons/GenerateWithAiButton.tsx`
  - Reusable button to open modal from multiple entry points
- i18n: add keys in `src/locales/en.json` and `src/locales/fr.json` for labels and errors

Existing files to update

- `src/pages/ProjectDetail.tsx`
  - Add modal state; open from header and tasks section; on import, create tasks (status `TODO`) then invalidate queries
- `src/components/projects/ProjectTasks.tsx`
  - Add header ghost button “Generate with AI…”; plumb `onGenerateAi` down
- `src/components/projects/ProjectSmartTaskList.tsx`
  - Empty state dual CTA: primary “Generate with AI”, secondary “Create manually”; accept optional `onGenerateAi`
- `src/components/projects/ProjectDetailsHeader.tsx`
  - Add kebab menu item “Generate tasks with AI…”
- `src/hooks/useTasks.ts`
  - Optional: add `useCreateTasksBatch` helper to sequence multiple create calls and consolidate invalidations
- `src/services/tasks.ts`
  - Optional: `createTasksBulk` convenience; otherwise loop in UI
- `src/types/task.ts`
  - No change; confirm `TODO` present (it is)
- `src/components/tasks/SmartTaskList.tsx`
  - No change P1 (dual CTA handled in `ProjectSmartTaskList`)
- `.env` / deploy config
  - Add `VITE_FEATURE_AI_TASKGEN=true` for gating

Minimal FE DTOs (add to `src/types/ai.ts`)

```ts
export type AiPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type GenerateTasksRequest = {
  prompt: string;
  projectId?: string;
  locale?: string;
};
export type GeneratedTask = {
  title: string;
  description?: string;
  priority?: AiPriority;
};
export type GenerateTasksResponse = {
  tasks: ReadonlyArray<GeneratedTask>;
  meta?: { model?: string; provider?: string; degraded?: boolean };
};
```

Integration notes

- Feature flag: if `!isAiTaskGenEnabled()`, hide AI CTAs and show manual create only
- Permissions: reuse existing create-task capability checks
- Default count: 6; imported task status: `TODO`
- Telemetry: descoped in P1; rely on backend metrics (`ai.taskgen.request/error/latency`)

Feature Flag (UI-only, localStorage-backed)

Goal

- Toggle AI task generation UI from the Settings page, persisted in `localStorage`, app-scope only (no server dependency) for P1.

New resources

- `src/contexts/FeatureFlagsContext.tsx`
  - Provides `{ aiTaskGenEnabled: boolean, setAiTaskGenEnabled(next: boolean): void }`
  - Initializes from `localStorage.getItem('FF_AI_TASKGEN') === 'true'`
  - Persists on change to `localStorage.setItem('FF_AI_TASKGEN', String(value))`
- `src/hooks/useFeatureFlags.ts`
  - Convenience hook to consume context

Wiring

- Wrap app in `FeatureFlagsProvider` in `src/main.tsx` (outside `QueryProvider` is fine)
- Replace env-gate helper with context-aware helper in `src/lib/features.ts`:
  - `export function isAiTaskGenEnabled(flags: { aiTaskGenEnabled: boolean }) { return flags.aiTaskGenEnabled; }`
  - Call sites use `const { aiTaskGenEnabled } = useFeatureFlags()`

Settings integration

- Update `src/pages/Settings.tsx` (or equivalent settings screen) to add a toggle:
  - Label: “Enable AI task generation (local)”
  - Bound to `aiTaskGenEnabled`
  - Tooltip: “Client-side toggle; backend must have AI tools enabled.”

Call sites to gate

- `ProjectDetail.tsx`, `ProjectTasks.tsx`, `ProjectSmartTaskList.tsx`, `ProjectDetailsHeader.tsx` should read `useFeatureFlags()` and hide AI CTAs when disabled.

Storage key

- `FF_AI_TASKGEN` (string `'true' | 'false'`)

Tests impact

- Wrap `TestWrapper` and `TestAppWithRouting` with `FeatureFlagsProvider`; default `aiTaskGenEnabled=true` in tests with an override for negative cases.
