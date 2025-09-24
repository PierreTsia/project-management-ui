Bulk Task Creation API + UI Integration (PR-005.BULK)

References

- Generate First Tasks with AI — [spec:project-management-ui/docs/dev-plans/generate-project-first-ai-tasks.md]
- Backend usage guide — [spec:project-management-api/docs/dev-plans/pr-005-task-generator-usage.md]
- MCP operational spec — [spec:project-management-api/docs/dev-plans/operational-mcp-integration-spec.md]
- Existing FE task service — `project-management-ui/src/services/tasks.ts`
- Existing BE tasks module — `project-management-api/src/tasks/*`

Summary & Scope

- Objective: Stop creating AI-generated tasks one-by-one and introduce a robust bulk-creation endpoint and UI integration to avoid crashes and reduce latency.
- In scope: New backend `POST /tasks/bulk` endpoint, strict DTOs/validation, transactional create-many service, rate/size limits, FE service + hook, AI modal import step integration, tests, telemetry.
- Out of scope: Deduplication heuristics beyond basic normalization, conflict resolution UI, reordering, subtasks.

Assumptions & Constraints

- Max items per request: 25 (configurable).
- AuthZ: User must have permission to create tasks in the target project.
- Atomicity: All-or-nothing within a transaction.
- Idempotency: Optional header `Idempotency-Key`; if supplied, server ensures at-least-once safety for identical payloads within 24h.
- Performance: End-to-end p95 ≤ 800ms for 12 tasks on production-sized datasets.
- Backwards compatibility: Existing single-create endpoint remains.

Open Questions (Blocking)

- [x] Final per-request limit? Decision: 25. Owner: PM/Backend
- [x] Partial successes? Decision: No — atomic-only. Owner: PM
- [x] Required fields beyond `title`, `projectId`? Decision: `status` defaults to `TODO`; `priority` optional. Owner: PM
- [x] Enforce uniqueness of `title` within a project at creation time? Decision: No. Owner: PM

Incremental Plan

Phase 0 — Foundations

- [ ] Add metrics counters: `tasks.bulk.request`, `tasks.bulk.success`, `tasks.bulk.error`, histogram `tasks.bulk.items` [spec]
- [ ] ADR: Atomic vs partial bulk semantics; decide on idempotency strategy [spec]

Phase 1 — Backend Endpoint

- [ ] Define DTOs in `project-management-api/src/tasks/dto/create-task-bulk.dto.ts` with `class-validator` [spec]
- [ ] Add controller route `POST /tasks/bulk` in `tasks.controller.ts` [spec]
- [ ] Implement service method `TasksService.createMany(dto: CreateTaskBulkDto, user: AuthUser)` with MikroORM `em.transactional` [spec]
- [ ] Enforce per-request item limit and validate all items (title non-empty, projectId required) [spec]
- [ ] Map optional fields: `description?`, `priority?`, `status?` (default `TODO`) [spec]
- [ ] Add idempotency middleware/guard keyed by header `Idempotency-Key` (optional) [spec]
- [ ] Return created tasks array with minimal public shape (id, title, status, priority, projectId, createdAt) [spec]
- [ ] Add unit tests for DTO validation and service transactional behavior [spec]
- [ ] Add integration tests for `POST /tasks/bulk` happy path and input errors [spec]

Phase 2 — Frontend Integration

- [x] Add FE DTOs `CreateTaskBulkItem`, `CreateTaskBulkRequest`, `CreateTaskBulkResponse` in `project-management-ui/src/types/task.ts` or new `src/types/tasks-bulk.ts` [spec]
- [x] Implement `createTasksBulk` in `project-management-ui/src/services/tasks.ts` (POST `/tasks/bulk`) [spec]
- [x] Add `useCreateTasksBulk` React Query mutation in `project-management-ui/src/hooks/useTasks.ts` (or new hook) [spec]
- [x] Update `GenerateAiTasksModal` import step to call bulk by default (atomic-only; no sequential fallback) [spec:project-management-ui/docs/dev-plans/generate-project-first-ai-tasks.md]
- [x] Show success toast on import
- [-] Highlight newly inserted rows
- [x] Handle degraded mode/info banner as-is; reuse existing error UI [spec]
- [x] Add unit tests for hook and service adapter; add integration test to assert single bulk call [spec]

Phase 3 — Guardrails & Observability

- [ ] UI: Disable primary CTA and show tooltip when over limit (e.g., >25) [spec]
- [ ] BE: Rate limit per user/project for bulk endpoint (e.g., 10/min) [spec]
- [ ] Trace span `tasks.bulk.create` including items count and duration; log idempotency usage [spec]
- [ ] Alerting: error rate and latency SLOs dashboards [spec]

Phase 4 — Rollout

- [ ] Deploy backend endpoint and FE integration; monitor metrics and logs [spec]
- [ ] Document migration and update `generate-project-first-ai-tasks.md` to mark Phase 5 done [spec]

API/Schema & Types Impact

- Backend request:
  - `POST /tasks/bulk`
  - Body: `{ projectId: string; items: Array<{ title: string; description?: string; priority?: 'LOW'|'MEDIUM'|'HIGH'; status?: 'TODO'|'IN_PROGRESS'|'DONE' }> }`
  - Headers: `Idempotency-Key?: string`
  - Response: `{ tasks: Array<{ id: string; title: string; description?: string; priority?: 'LOW'|'MEDIUM'|'HIGH'; status: string; projectId: string; createdAt: string }> }`
- Frontend types: add strict DTOs, avoid `any`; map server enums to app enums.

UX Acceptance Criteria & Test Plan

- [ ] Given AI results selected (up to limit), when importing, a single network call is made to `/tasks/bulk` and completes without UI crash.
- [ ] On success, N tasks appear with status `TODO` by default and a toast "N tasks added" is shown.
- [ ] If item count exceeds limit, the UI disables import and shows an explanatory tooltip.
- [ ] If the backend rejects due to validation, the modal preserves selection and shows a retriable error.
- [ ] A11y: import button remains reachable and announces progress via ARIA live region.
- [ ] Tests: BE unit + integration for bulk; FE unit for hook/service; FE integration tests for modal import happy path and validation error.

Risks & Mitigations

- Large payloads causing timeouts → Enforce strict item limits and reasonable payload size; consider compression.
- Duplicate titles imported → Leave to user for now; consider dedupe P2.
- Partial failure semantics confusion → Keep atomic; log rejected reasons for observability.
- Idempotency complexity → Optional header; document clients usage; add short TTL cache.

Rollout

- Telemetry: monitor request rate, error rate, p95 latency, average items per request.

Definition of Done

- [ ] Endpoint `POST /tasks/bulk` implemented, tested, and documented.
- [ ] FE uses bulk endpoint in AI import flow.
- [ ] Acceptance criteria pass locally and in CI.
- [ ] Metrics dashboards show healthy rates/latency; no UI crashes observed post-rollout.
- [ ] Docs updated in both repos.

Changelog

- 2025-09-24: Initial draft created based on AI-generated tasks import needs.
