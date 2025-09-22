Replace Project Tasks List with SmartTaskList (UI-PL-2025-09-22)

References

- Source files
  - `src/pages/ProjectDetail.tsx`
  - `src/components/projects/ProjectTasks.tsx`
  - `src/components/projects/ProjectTasksListView.tsx`
  - `src/components/tasks/SmartTaskList.tsx`
  - `src/components/tasks/TaskFilters.tsx`
- Tests
  - `src/__tests__/pages/ProjectDetail.test.tsx`
  - `src/__tests__/components/tasks/TaskTable.test.tsx`
  - `src/__tests__/components/tasks/TaskFilters.test.tsx`

Summary & Scope

- Replace the Project detail page’s current tasks list view with `SmartTaskList`.
- Provide in-view sorting and filtering (local component state) with no URL/query param coupling for now.
- Preserve current empty/loading/error UX and existing actions (open task, navigate to task, etc.).
- Out of scope: deep-linkable filters, query-param sync, server-side sorting/filtering, relation filters beyond what SmartTaskList already supports.

Assumptions & Constraints

- `SmartTaskList` supports a data source prop or hook compatible with project-scoped tasks.
- We can fetch project tasks via existing hooks/services (`useTasks`, `services/tasks.ts`) filtered by `projectId`.
- Sorting and filtering are client-side only and reset on navigation.
- No breaking changes to public task types; if needed, adapt via lightweight mapping inside the container.

Decisions

- Default sort order: dueDate ascending → priority descending → updatedAt descending.
- v1 filters: status, assignee, priority, dueDate range.
- Do not remember filters across navigation in v1.

Open Questions (Blocking)

- [x] Confirm which default sort to apply (e.g., updatedAt desc, dueDate asc, priority). Owner: PM — Decision: dueDate asc → priority desc → updatedAt desc
- [x] Confirm the minimum filter set for v1 (status, assignee, priority, due date). Owner: PM — Decision: status, assignee, priority, dueDate range
- [x] Should list remember filters during page lifetime (in-memory) when navigating within the project? Owner: PM — Decision: No for v1

Incremental Plan

- Phase 0 — Groundwork
  - [ ] Audit `SmartTaskList` props and events to ensure it can render project-scoped tasks without URL sync. [ref:`src/components/tasks/SmartTaskList.tsx`]
  - [ ] Verify existing project tasks fetch path and types (`useTasks`, `services/tasks.ts`) for `projectId` support. [ref:`src/hooks/useTasks.ts`, `src/services/tasks.ts`]
  - [ ] Identify current list integration points on Project detail page. [ref:`src/pages/ProjectDetail.tsx`, `src/components/projects/ProjectTasks.tsx`, `src/components/projects/ProjectTasksListView.tsx`]

- Phase 1 — Integration (Behind dev flag or guarded code path if needed)
  - [ ] Create a new container `ProjectSmartTaskList` that wires `projectId` to the data source and renders `SmartTaskList`. (depends on: Phase 0)
  - [ ] Implement local sorting/filtering state inside the container; do not read/write query params. (depends on: Phase 0)
  - [ ] Ensure row click and actions match current behavior (open task details, navigate to task route). (depends on: Phase 0)
  - [ ] Preserve loading/empty/error states consistent with current UX. (depends on: Phase 0)

- Phase 2 — Replace Existing View
  - [ ] Swap `ProjectTasksListView` usage with `ProjectSmartTaskList` in the Project detail page composition. (depends on: Phase 1)
  - [ ] Remove or deprecate obsolete glue code specific to the old list view inside `ProjectTasks.tsx` if not reused. (depends on: Phase 1)

- Phase 3 — Tests & Polish
  - [ ] Update/extend tests: Project detail renders `SmartTaskList` with project-scoped tasks. [ref:`src/__tests__/pages/ProjectDetail.test.tsx`]
  - [ ] Add unit tests for sorting and filtering behavior in the new container (no URL coupling). [ref:`src/__tests__/components/tasks/TaskFilters.test.tsx`]
  - [ ] Add empty-state and error-state tests.
  - [ ] Verify accessibility: keyboard navigation, focus order, ARIA labels remain valid.

API/Schema & Types Impact

- No backend schema changes anticipated.
- TypeScript: ensure task item type consumed by `SmartTaskList` matches `Task` from existing types; add a narrow adapter type if needed, avoiding `any` per TS rules.

UX Acceptance Criteria & Test Plan

- [ ] On Project detail, tasks render using `SmartTaskList` scoped to the current `projectId`.
- [ ] Sorting toggles update the visible order without URL changes. Default: dueDate asc → priority desc → updatedAt desc.
- [ ] Filters (status, assignee, priority, dueDate range) apply locally and can be cleared; no URL changes.
- [ ] Empty state: when project has no tasks or filters exclude all, an informative empty state is shown.
- [ ] Error state: on fetch error, an error UI appears with a retry path.
- [ ] Performance: first paint of list within acceptable bounds vs current (no regressions noticeable to user).
- [ ] Actions: clicking a task opens/navigates exactly as in current implementation.

Risks & Mitigations

- SmartTaskList prop mismatch with project data — Mitigate by adding a thin adapter in the container.
- Client-only sorting/filtering on large projects — Mitigate by limiting page size/virtualization already present in SmartTaskList.
- Behavior regressions (navigation, selection) — Mitigate with targeted e2e/unit tests and side-by-side QA.

Rollout & Feature Flags

- Keep simple: direct swap in the Project detail page. If needed, guard with an env flag to flip quickly during QA.

Definition of Done

- [ ] `SmartTaskList` replaces the old list on Project detail for all users.
- [ ] Sorting and filtering work locally with no URL/query param changes.
- [ ] Tests updated/added and passing (unit + page-level).
- [ ] Accessibility checks pass (axe, keyboard navigation).
- [ ] Obsolete code paths cleaned or deprecated with clear removal follow-up.

Changelog

- 2025-09-22: Initial draft.
- 2025-09-22: Added decisions for default sort, v1 filters, and no filter memory.
