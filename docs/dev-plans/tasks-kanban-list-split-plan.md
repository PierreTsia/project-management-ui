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

- Objective: Create two subroutes using `:viewType` query parameter ("kanban" | "list") to separate view-specific pagination/state and avoid conflicting fetch models.
- In scope:
  - Add new routes: `/tasks?viewType=list` and `/tasks?viewType=kanban` (replacing existing `/tasks`).
  - Implement separate data fetching with distinct query keys and caches per view.
  - Accurate Kanban column counts and load-more per column.
  - Drag-and-drop updates scoped refresh to affected columns.
- Out of scope (Phase 1):
  - Query parameter synchronization between views (Phase 2+).
  - Backend changes beyond minimal support for status-scoped cursor (tracked but may be parallelized in API epic).
  - Massive design revamp; stick to existing components.
  - Migration of existing `/tasks` route (Phase 2+).

## Assumptions & Constraints

- We can add either cursor support to `/tasks/search` or introduce `/tasks/board` in API. [spec:API-Service]
- React Router v6 is in use; query parameter routing is supported.
- React Query is used for caching; keys must not collide between views.
- Large workspaces may have thousands of tasks; Kanban must not fetch all at once.
- Existing `/tasks` route remains functional during development.

## Open Questions (Blocking)

- [ ] Confirm API path: extend `/tasks/search` with `status` + `cursor` vs add `/tasks/board` aggregate. Owner: Backend [spec:API-Controller]
- [ ] Confirm Figma for list/board header, tabs-as-links, and per-column load control UX. Owner: Design [figma:TASKS#TBD]
- [ ] Define maximum per-column page size (50/100) and performance SLA. Owner: PM/Eng [spec:API-Service]
- [ ] Should board show totals across all results or filtered scope only? Owner: PM [spec:UI-Kanban]
- [ ] Analytics: track view switches, load-more, DnD moves. Owner: PM/Analytics
- [x] Route naming: `/tasks` with `viewType` query parameter. Owner: Frontend [spec:UI-Tasks]

## Incremental Plan

### Phase 0 — New Route Foundation

- [x] Add new route: `/tasks` with `viewType` query parameter validation ("kanban" | "list"). [spec:UI-Tasks]
- [x] Create `TasksPage` component that renders either list or kanban view based on `viewType` param. [spec:UI-Tasks]
- [x] Add view type validation and default fallback to "list" if invalid/missing. [spec:UI-Data]
- [x] Replace existing `/tasks` route with new implementation. [spec:UI-Tasks]

### Phase 1 — List View Implementation

- [x] Create `TasksListView` component by copying current table implementation from existing Tasks page. [spec:UI-Tasks]
- [x] Implement separate query keys `['tasks','global','list', filters, {page,limit}]` to avoid cache collisions. [spec:UI-Data]
- [x] Ensure list view works independently with its own pagination state. [spec:UI-Data]
- [ ] Unit tests for list view query param handling and pagination behavior. [spec:UI-Data]

### Phase 2 — Kanban View Implementation

- [x] Create `TasksKanbanView` component by adapting existing `ProjectTasksKanbanView` for global tasks. [spec:UI-Kanban]
- [x] Implement `useKanbanTasks(filters)` hook: per-status loaders with independent query keys and totals. Keys `['tasks','global','search', filters, {status, limit}]`. [spec:UI-Service]
- [x] UI wiring: `TasksKanbanView` receives `columns={status, tasks, total, hasMore}` and `onLoadMore(status)` and/or `onIntersectEnd(status)`. [spec:UI-Kanban]
- [x] Column badges display `total`; initial fetch pulls first N per column. [spec:UI-Kanban]
- [x] Infinite loading per column (default): use an IntersectionObserver sentinel at the end of each column to trigger `loadMore(status)` when visible; throttle requests; show inline skeletons. [figma:TASKS#TBD]
- [ ] Virtualize column lists when item count > threshold (e.g., 200) to prevent scroll jank; fall back to simple list below threshold. [spec:UI-Kanban]
- [x] Empty, loading, and error states per column with retry. [spec:UI-Kanban]

### Phase 3 — View Switching & Navigation

- [x] Add view type tabs/buttons in `TasksPage` to switch between "list" and "kanban" views. [spec:UI-Tasks]
- [x] Implement URL updates when switching views (preserve other query params). [spec:UI-Data]
- [ ] Add view type persistence in localStorage for user preference. [spec:UI-Data]

### Phase 4 — Drag & Drop and Mutations

- [ ] Update DnD move to optimistically update source/target columns; on success, revalidate only those columns. [spec:UI-Kanban]
- [ ] Respect filters when moving (e.g., if a move changes status, remove from source; if target column filtered by assignee and no longer matches, do not insert). [spec:UI-Data]
- [ ] Bulk actions compatibility: selection model per column and cross-column select if supported. [spec:UI-Kanban]

### Phase 5 — API Integration

- [ ] If extending `/tasks/search`: add `status`, `cursor`, `limit`; return `{tasks, total, nextCursor}`. UI: call per status. [spec:API-Controller]
- [ ] If adding `/tasks/board`: implement aggregate response for TODO/IN_PROGRESS/DONE with per-column `nextCursor`. UI: single initial call + per-column load-more. [spec:API-Service]
- [ ] Feature-flag board cursor behavior if needed for staged rollout. [jira:TASKS-XXX]

### Phase 6 — QA, Perf, A11y, Docs

- [ ] Vitest unit tests for hooks, URL param reducers, and DnD handlers (AAA pattern). [spec:Testing]
- [ ] E2E happy path: view switching works; board loads per-column; DnD updates persist. [spec:Testing]
- [ ] Performance test: large dataset with 5k+ tasks validates per-column paging keeps payloads ≤ 200KB. [spec:API-Service]
- [ ] Accessibility: keyboard nav for view tabs, ARIA for board columns and cards, focus management on DnD. [figma:TASKS#TBD]
- [ ] Update README and `docs/` with usage and route semantics. [spec:DOC-Tasks]

### Phase 7 — Migration (Future)

- [x] Migration completed: `/tasks` route now uses new implementation. [spec:UI-Tasks]
- [ ] Implement gradual rollout with feature flags. [jira:TASKS-XXX]

## API/Schema & Types Impact

- UI Types: add `BoardColumn` and `BoardColumnResponse` in `src/types/task.ts`; avoid `any`, use discriminated unions for status. [spec:UI-Data]
- Service: new `TasksService.searchBoardTasks` or enhanced `searchAllUserTasks(status,cursor)`. [spec:UI-Service]
- React Query keys separated per view; no collisions.
- Backend: cursor token format is opaque string derived from last item’s sort field(s); response includes `nextCursor` per status. [spec:API-Service]

## UX Acceptance Criteria & Test Plan

- [x] Navigating to `/tasks` defaults to list view; `/tasks?viewType=kanban` shows kanban view.
- [x] View switching via tabs/buttons updates URL and preserves other query parameters.
- [x] Kanban shows accurate per-column totals and supports infinite loading per column without affecting other columns.
- [x] Load More button triggers next page load with smooth animations and natural scroll behavior.
- [x] Loading indicators appear in-column; errors provide a per-column retry that resumes from the last cursor.
- [x] List view pagination works independently with its own state; no regressions in sorting/filtering.
- [x] New `/tasks` route is fully functional with both list and kanban views.
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

- [x] `/tasks` route live with `viewType` query parameter support ("kanban" | "list").
- [x] Both list and kanban views render correctly with separate query keys and caches.
- [x] View switching works via tabs/buttons with URL updates.
- [x] Kanban uses per-column cursor loading with accurate totals.
- [x] New `/tasks` route is fully functional with both views.
- [ ] Unit and E2E tests passing; accessibility verified.
- [ ] Docs updated; analytics events tracked.

## Changelog

- 2025-09-22: Initial v0 draft of the battle plan.
- 2025-01-27: Refined approach to use `/tasks-v2` with `viewType` query parameter, keeping existing `/tasks` untouched during development.
- 2025-01-27: Completed Phase 0-2 implementation with optimized Kanban view featuring per-column data fetching and infinite scroll.
- 2025-01-27: **MVP COMPLETE** - Core functionality delivered with elegant Load More button, smooth animations, and fixed column footer layout. Remaining phases (4-7) marked as future enhancements.
- 2025-01-27: **V2 CLEANUP COMPLETE** - Removed all V2 naming, migrated to main `/tasks` route, updated documentation. Old implementation backed up as `Tasks.old.tsx`.
