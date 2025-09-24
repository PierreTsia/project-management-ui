Global Task Search — Filter by Projects (FE-Global-Search-Projects)

References

- Backend ticket/spec — [spec:project-management-api/docs/backend-tickets/global-task-search-filter-by-projects.md]
- Backend plan — [spec:project-management-api/docs/dev-plans/global-task-search-filter-by-project-status-plan.md] (context on search infra)
- Current FE code: `src/components/tasks/TaskFilters.tsx`, `src/hooks/useTasksQueryParams.ts`, `src/hooks/useTasks.ts`, `src/services/tasks.ts`, `src/types/task.ts`, `src/pages/Tasks.tsx`, `src/hooks/useActiveFilters.ts`, `src/services/projects.ts`, `src/hooks/useProjects.ts`

Summary & Scope

- Add a Projects multi-select to global task search filters so users can filter by one or more projects. Wire it through URL params, query hooks, and API calls.
- Keep default behavior: no selection → ALL accessible projects (no `projectIds` param sent).
- Remove legacy `projectId` usage in FE global search types and mapping.
- Out of scope: backend changes (already done), DB/index work, new endpoints, project picker reuse across other pages.

Assumptions & Constraints

- Backend accepts `projectIds?: string[]` (UUIDs), max length 50; empty array should be treated as ALL (we’ll avoid sending empty arrays).
- FE URL params will encode arrays as comma-separated strings (consistent with `useQueryParamHelper` array serializer).
- We have an endpoint to fetch projects for the current user: `ProjectsService.getProjects` with search capability for async typeahead.
- Internationalization keys exist or will be added for the new UI labels.

Open Questions (Blocking)

- [x] What project display should we show in chips/options? Decision: `project.name` only. Owner: PM/Design
- [x] Should we show archived/inactive projects in the picker? Decision: Yes; BE supports it. Owner: PM
- [x] Do we need a quick “My projects only” toggle? Decision: Yes, align with other shortcuts. Owner: PM
- [x] Max client-side selection cap? Decision: 20 (disable further selection + toast). Owner: FE

Incremental Plan

- Phase 0 — Foundations
  - [ ] Add ADR note in FE plan changelog referencing BE decision to remove `projectId` and add `projectIds` [spec:project-management-api/docs/backend-tickets/global-task-search-filter-by-projects.md]

- Phase 1 — Types and URL Mapping
  - [ ] Update `GlobalSearchTasksParams` in `src/types/task.ts`: remove `projectId?: string`; add `projectIds?: string[]`.
  - [ ] Extend `useTasksQueryParams` mapping in `src/hooks/useTasksQueryParams.ts` to include `projectIds` with `queryParamSerializers.array`.
  - [ ] Ensure `createTruthyObject` handling does not drop valid arrays; keep when non-empty.

- Phase 2 — UI Component: Projects Multi-select
  - [ ] Add projects multi-select to `src/components/tasks/TaskFilters.tsx` form, labeled via i18n (`tasks.filters.projects`).
  - [ ] Implement a reusable multi-select UI based on Command/Popover (similar to `AsyncSelect`) that supports multiple selections with badges and search.
    - [ ] New component: `src/components/ui/async-multi-select.tsx` (fetch on type; render options; show selected count; clear all; keyboard navigation).
  - [ ] Wire the component to `ProjectsService.getProjects` with search term; map to `{ id, name }` at minimum.
  - [ ] On submit, include `projectIds` only when the array is non-empty.
  - [ ] Update summary bar in `TaskFilters` to show selected project chips (truncate with "+N" if >3).
  - [ ] Add badges row: "All" badge (active when none selected), per-project badges with remove action, overflow "+N" pill.
  - [ ] Add "My projects only" quick toggle (mutually exclusive with explicit selections; deactivates when user selects a specific project).
  - [ ] Include archived/inactive projects in selector; subtly dim/secondary style the option/badge.
  - [ ] Enforce selection cap of 20 projects; show non-blocking toast when limit reached.
  - [ ] Responsive small screens (≤640px):
    - [ ] Collapse badges into a horizontal scroll row; enable swipe with momentum.
    - [ ] Truncate long project names in badges with ellipsis; tooltip on long-press.
    - [ ] Use a bottom-sheet style popover for the selector on mobile (full-width, 80% height, sticky search input).
    - [ ] Keep selector open on item toggle; add explicit Done button on mobile.
    - [ ] Ensure touch targets ≥ 44px and spacing suitable for thumb reach.
    - [ ] Keyboard and screen reader support preserved (aria labels, focus trap, ESC to close).

- Phase 3 — Hooks and Data Flow
  - [ ] Validate that `useSearchAllUserTasks` in `src/hooks/useTasks.ts` passes `projectIds` through to `TasksService.getAllUserTasks/searchAllUserTasks` (should be no change; params are forwarded verbatim).
  - [ ] Verify `taskKeys.globalList/globalSearch` cache keys include `projectIds` so results are isolated per selection.
  - [ ] Ensure `useTasksQueryParams` correctly deserializes arrays from the URL and updates the UI initial state.

- Phase 4 — i18n and Copy
  - [ ] Add translation keys for labels/placeholders and filter summary: `tasks.filters.projects`, `tasks.filters.allProjects`, `tasks.filters.selectProjects`, `tasks.filters.projectsSelected`.

- Phase 5 — Tests
  - [ ] Unit: `types/task.ts` compile checks (no `projectId` in global params; `projectIds` typed correctly).
  - [ ] Unit: `useTasksQueryParams` array serialization/deserialization for `projectIds`.
  - [ ] Component: `TaskFilters` renders multi-select, selects multiple projects, applies and clears correctly; summary badges render; URL updates.
  - [ ] Service/Hook integration: `useSearchAllUserTasks` includes `projectIds` in requests; cache keys vary.
  - [ ] E2E (or integration on page): navigating with `?projectIds=a,b` initializes UI and returns filtered tasks.
  - [ ] Mobile snapshot/E2E: badges overflow scroll, bottom-sheet selector, Done button applies selection.

API/Schema & Types Impact

- Frontend Type changes (no backend changes needed):
  - `GlobalSearchTasksParams`: remove `projectId?: string`; add `projectIds?: string[]`.
- URL params encoding: `projectIds` serialized as `projectIds=a,b,c`.

UX Acceptance Criteria & Test Plan

- Given the Tasks page, when I open filters, I can search and select multiple projects from a typeahead list.
- When I apply filters with `projectIds=[P1,P2]`, only tasks belonging to P1 or P2 are shown; pagination and other filters still apply.
- When I clear the selection, tasks from all accessible projects are shown (no `projectIds` param sent).
- When more than 3 projects are selected, the summary shows the first 3 chips and "+N".
- URL reflects selections as `projectIds` CSV and reload preserves state.
- Screen-reader labels exist for the control and chips; keyboard navigation works within the popover.

Risks & Mitigations

- Large lists degrade popover performance → async fetch + debounce; limit page size; simple row rendering.
- Confusion with legacy `projectId` → types cleanup and tests ensure it’s removed from global search.
- Max length (50) not enforced on FE → validate client-side; disable selection beyond 50 with toast.

Rollout & Feature Flags

- No flag needed; backward compatible when no selection is made.

Definition of Done

- [ ] `projectIds` flows from UI → URL → hooks → services, with tests passing.
- [ ] `TaskFilters` displays and manages multi-select with accessible UX.
- [ ] Global tasks list updates correctly and caches per selection.
- [ ] i18n keys added and translated for EN/FR.

Changelog

- 2025-09-22: Initial FE plan drafted; aligned with BE `projectIds` support.
