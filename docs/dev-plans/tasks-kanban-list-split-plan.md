# Split Tasks into List and Kanban Subpages (KANBAN-SPLIT-UI)

## References

- Existing Tasks page implementation — `src/pages/Tasks.tsx` [spec:UI-Tasks]
- Global tasks search hook — `src/hooks/useTasks.ts` (`useSearchAllUserTasks`) [spec:UI-Data]
- Tasks service — `src/services/tasks.ts` (`searchAllUserTasks`) [spec:UI-Service]
- Kanban view — `src/components/projects/ProjectTasksKanbanView.tsx` [spec:UI-Kanban]
- Prior plan — `docs/done/tasks-page-battle-plan.md` [spec:DOC-Tasks]
- API controller — API repo `src/tasks/controllers/global-tasks.controller.ts` [spec:API-Controller]
- API service — API repo `src/tasks/tasks.service.ts` (pagination logic) [spec:API-Service]
- Figma: Tasks List and Kanban layouts [figma:TASKS#TBD]
- Jira Epic/Story: Split tasks views and pagination models [jira:TASKS-XXX]

## Summary & Scope

- Objective: Decouple Tasks into two subpages with view-specific pagination/state to avoid conflicting fetch models.
- In scope:
  - Add routes: `/tasks/list` (table with page/limit) and `/tasks/kanban` (column-wise cursor/infinite load).
  - Preserve shared filters in URL; isolate view-specific params.
  - Data fetching with separate query keys and caches per view.
  - Redirect `/tasks` to last used view, defaulting to list.
  - Accurate Kanban column counts and load-more per column.
  - Drag-and-drop updates scoped refresh to affected columns.
- Out of scope:
  - Backend changes beyond minimal support for status-scoped cursor (tracked but may be parallelized in API epic).
  - Massive design revamp; stick to existing components.

## Assumptions & Constraints

- We can add either cursor support to `/tasks/search` or introduce `/tasks/board` in API. [spec:API-Service]
- Filters set on one view must apply when switching to the other (shared subset only).
- React Router v6 is in use; nested routes are supported.
- React Query is used for caching; keys must not collide between views.
- Large workspaces may have thousands of tasks; Kanban must not fetch all at once.

## Open Questions (Blocking)

- [ ] Confirm API path: extend `/tasks/search` with `status` + `cursor` vs add `/tasks/board` aggregate. Owner: Backend [spec:API-Controller]
- [ ] Confirm Figma for list/board header, tabs-as-links, and per-column load control UX. Owner: Design [figma:TASKS#TBD]
- [ ] Define maximum per-column page size (50/100) and performance SLA. Owner: PM/Eng [spec:API-Service]
- [ ] Should board show totals across all results or filtered scope only? Owner: PM [spec:UI-Kanban]
- [ ] Analytics: track view switches, load-more, DnD moves. Owner: PM/Analytics

## Incremental Plan

### Phase 0 — Foundations

- [ ] Add routes: `/tasks/list`, `/tasks/kanban`; redirect `/tasks` to last view in localStorage `tasks:lastView`. [spec:UI-Tasks]
- [ ] Extract shared filter bar into parent `TasksRoute` so both subpages inherit and sync shared query params. [spec:UI-Tasks]
- [ ] Introduce query param schema: shared (projectIds, assignee, query, status?), list-only (page, limit), kanban-only (cursorTodo, cursorInProgress, cursorDone). [spec:UI-Data]

### Phase 1 — List View Stability

- [ ] Move current table implementation into `/tasks/list` preserving existing pagination and query keys `['tasks','list', filters, {page,limit}]`. [spec:UI-Tasks]
- [ ] Ensure switching from `/tasks/kanban` preserves shared params and drops kanban cursors. [spec:UI-Data]
- [ ] Unit tests for query param preservation and pagination behavior. [spec:UI-Data]

### Phase 2 — Kanban Data Model

- [ ] Implement `useBoardTasks(filters)` hook: per-status loaders with independent cursors and totals. Keys `['tasks','kanban', filters, {cursorByStatus}]`. [spec:UI-Service]
- [ ] UI wiring: `ProjectTasksKanbanView` receives `columns={status, tasks, total, hasMore}` and `onLoadMore(status)` and/or `onIntersectEnd(status)`. [spec:UI-Kanban]
- [ ] Column badges display `total`; initial fetch pulls first N per column. [spec:UI-Kanban]
- [ ] Infinite loading per column (default): use an IntersectionObserver sentinel at the end of each column to trigger `loadMore(status)` when visible; throttle requests; show inline skeletons. [figma:TASKS#TBD]
- [ ] Virtualize column lists when item count > threshold (e.g., 200) to prevent scroll jank; fall back to simple list below threshold. [spec:UI-Kanban]
- [ ] Empty, loading, and error states per column with retry. [spec:UI-Kanban]

### Phase 3 — Drag & Drop and Mutations

- [ ] Update DnD move to optimistically update source/target columns; on success, revalidate only those columns. [spec:UI-Kanban]
- [ ] Respect filters when moving (e.g., if a move changes status, remove from source; if target column filtered by assignee and no longer matches, do not insert). [spec:UI-Data]
- [ ] Bulk actions compatibility: selection model per column and cross-column select if supported. [spec:UI-Kanban]

### Phase 4 — API Integration

- [ ] If extending `/tasks/search`: add `status`, `cursor`, `limit`; return `{tasks, total, nextCursor}`. UI: call per status. [spec:API-Controller]
- [ ] If adding `/tasks/board`: implement aggregate response for TODO/IN_PROGRESS/DONE with per-column `nextCursor`. UI: single initial call + per-column load-more. [spec:API-Service]
- [ ] Feature-flag board cursor behavior if needed for staged rollout. [jira:TASKS-XXX]

### Phase 5 — QA, Perf, A11y, Docs

- [ ] Vitest unit tests for hooks, URL param reducers, and DnD handlers (AAA pattern). [spec:Testing]
- [ ] E2E happy path: filters persist across view switches; board loads per-column; DnD updates persist. [spec:Testing]
- [ ] Performance test: large dataset with 5k+ tasks validates per-column paging keeps payloads ≤ 200KB. [spec:API-Service]
- [ ] Accessibility: keyboard nav for tabs-as-links, ARIA for board columns and cards, focus management on DnD. [figma:TASKS#TBD]
- [ ] Update README and `docs/` with usage and route semantics. [spec:DOC-Tasks]

## API/Schema & Types Impact

- UI Types: add `BoardColumn` and `BoardColumnResponse` in `src/types/task.ts`; avoid `any`, use discriminated unions for status. [spec:UI-Data]
- Service: new `TasksService.searchBoardTasks` or enhanced `searchAllUserTasks(status,cursor)`. [spec:UI-Service]
- React Query keys separated per view; no collisions.
- Backend: cursor token format is opaque string derived from last item’s sort field(s); response includes `nextCursor` per status. [spec:API-Service]

## UX Acceptance Criteria & Test Plan

- [ ] Navigating to `/tasks` redirects to last used view or `/tasks/list` if none.
- [ ] Switching between `/tasks/list` and `/tasks/kanban` preserves shared filters and view resumes from cached state.
- [ ] Kanban shows accurate per-column totals and supports infinite loading per column without affecting other columns.
- [ ] When the column end sentinel enters viewport and `hasMore=true`, the next page loads once; duplicate triggers are debounced.
- [ ] Loading indicators appear in-column; errors provide a per-column retry that resumes from the last cursor.
- [ ] Dragging a card updates its status and reflects immediately in UI; affected columns revalidate only.
- [ ] Table pagination works as today; no regressions in sorting/filtering.
- [ ] All new strings translatable; no console errors; lints pass.

## Risks & Mitigations

- Divergent state between views: use strict shared/query param contract and separate caches.
- Payload bloat on Kanban: per-column cursors with small page size; virtualize columns to keep DOM light.
- API readiness: build UI with mocked adapters; feature-flag rollout.
- DnD edge cases with filters: centralize item eligibility checks in helper functions.
- Infinite scroll jank on low-powered devices: use requestIdleCallback for heavy state merges and small batch sizes (e.g., 25–50 items).

## Rollout & Feature Flags

- Flag: `kanban_cursor_board` to gate new board data model.
- Gradual rollout: enable on staging, then internal, then 10%→100%.
- Metrics: view switch rate, board load-more usage, DnD success/error rates.

## Definition of Done

- [ ] `/tasks/list` and `/tasks/kanban` routes live; `/tasks` redirect implemented.
- [ ] Shared filters synchronized across views; view-specific params isolated.
- [ ] Kanban uses per-column cursor loading with accurate totals.
- [ ] DnD updates minimally revalidate; no global refetch thrash.
- [ ] Unit and E2E tests passing; accessibility verified.
- [ ] Docs updated; analytics events tracked.

## Changelog

- 2025-09-22: Initial v0 draft of the battle plan.
