# Parent-Child Collapsible Tasks for List and Kanban (TASKS-PARENT-COLLAPSE)

## References

- Existing Tasks List — `src/pages/Tasks.tsx` and table components [spec:UI-Tasks]
- Kanban — `src/components/projects/ProjectTasksKanbanView.tsx` [spec:UI-Kanban]
- Global tasks search — `src/hooks/useTasks.ts` (`useSearchAllUserTasks`) [spec:UI-Data]
- Tasks service — `src/services/tasks.ts` (`searchAllUserTasks`) [spec:UI-Service]
- Types — `src/types/task.ts` [spec:UI-Types]
- Prior plans — `docs/dev-plans/tasks-kanban-list-split-plan.md` [spec:DOC-Plan]
- API — project-management-api `src/tasks` (hierarchy/relations) [spec:API]
- Figma: Tasks hierarchy and disclosure affordance [figma:TBD]
- Jira Epic/Story: Parent-only listing with child progress [jira:TASKS-XXX]

## Summary & Scope

- Objective: In large task lists and Kanban, show only parent tasks by default, with a child-progress indicator (e.g., 1/5 done) and an affordance to expand/collapse to reveal child tasks inline/per column.
- In scope:
  - Collapse-by-default behavior for Smart List and Kanban columns.
  - Child progress badge on parent items; aggregate roll-up for counts.
  - Inline expansion to render children beneath the parent (list) or within the same column (kanban), with lazy loading.
  - URL/state persistence of expanded parents per view.
  - A11y/keyboard support for disclosure.
- Out of scope:
  - Creating/editing hierarchy; use existing parent-child relationships.
  - Massive visual redesign; reuse existing card/row components.

## Assumptions & Constraints

- Each task has `id`, optional `parentId`; children form at most one level deep for v1.
- API can return aggregate fields per parent: `childrenTotal`, `childrenDone` and `hasChildren`.
- For Kanban, children inherit status from themselves, not from parent; expanded render must respect column filters.
- Performance: Avoid fetching all children upfront; fetch on expand; cap children page size (e.g., 50).

## Open Questions (Blocking)

- [ ] Confirm definition of "done" for child progress (status set membership?) Owner: PM [spec:UI-Data]
- [ ] Should parents appear in columns by their own status even if children differ? Owner: PM [spec:UI-Kanban]
- [ ] When filters exclude some children (e.g., assignee), should counts reflect filtered scope or absolute? Owner: PM [spec:UI-UX]
- [ ] Persistence scope of expanded state: per route, per filter set, or global? Owner: PM [spec:UI-State]
- [ ] API shape preference: enrich parent rows with aggregates vs. separate `/tasks/:id/children` endpoint? Owner: Backend [spec:API]
- [ ] Max children fetch per expand and pagination UX if > N? Owner: PM/Eng [spec:UI]

## Incremental Plan

### Phase 0 — Data Model & Contracts

- [ ] Add UI types in `src/types/task.ts`: `TaskHierarchyInfo` and augment `TaskListItem` with `hasChildren`, `childrenTotal`, `childrenDone` [spec:UI-Types]
- [ ] Extend tasks service adapter to map API aggregates into UI types without `any` [spec:UI-Service]
- [ ] Add children fetch function `fetchTaskChildren(parentId, filters)` with typed DTO [spec:UI-Service]

### Phase 1 — List (Smart List) Experience

- [ ] Render parent-only by default: update list query to request `onlyParents=true` [spec:UI-Data]
- [ ] Add disclosure control on each parent row with badge `childrenDone/childrenTotal` [figma:TBD]
- [ ] On expand: lazy load children and render as indented rows; support collapse [spec:UI-Tasks]
- [ ] Preserve expanded state in URL (e.g., `expanded=taskA,taskB`) bounded length; fall back to memory if too long [spec:UI-State]
- [ ] Keyboard and screen-reader semantics for disclosure and nested rows [figma:TBD]
- [ ] Unit tests for state reducer, URL sync, and data adapters [spec:Testing]

### Phase 2 — Kanban Experience

- [ ] Column queries request parents only; show badge on parent cards [spec:UI-Kanban]
- [ ] Expand-in-column: fetch children and render as a grouped stack under the parent card; virtualize if large [spec:UI-Kanban]
- [ ] Respect filters: children list respects current board filters; display count badge reflecting filtered vs absolute per decision [spec:UI-Data]
- [ ] Maintain expanded state per column with stable keys; restore on back/forward [spec:UI-State]
- [ ] E2E happy path for expand/collapse and DnD constraints (see Phase 3) [spec:Testing]

### Phase 3 — Interactions & Mutations

- [ ] DnD: Prevent dragging a child outside its parent group when collapsed; allow reparenting only if supported by product rules [spec:UI-UX]
- [ ] On child status change, update parent progress optimistically; reconcile with server [spec:UI-Data]
- [ ] Bulk actions: operations on a parent prompt to include children as applicable [spec:UI-UX]

### Phase 4 — API Integration

- [ ] Extend search endpoints with parent-only mode and aggregates [spec:API]
  - `GET /tasks/search?onlyParents=true&...filters&cursor=&limit=` returns items with `hasChildren, childrenTotal, childrenDone`
  - Kanban: `GET /tasks/board?onlyParents=true&status=...&cursor=&limit=&...filters` with same aggregates
- [ ] Add children-by-parent endpoint returning Task rows with pagination and filters [spec:API]
  - `GET /projects/:projectId/tasks/:parentTaskId/children-tasks?cursor=&limit=&...filters`
  - Response: `{ items: TaskDto[], nextCursor: string | null, total?: number }`
  - Applies same visibility/filters as parent queries
- [ ] Keep existing hierarchy link endpoints as-is (relationship DTOs) for admin/diagnostics [spec:API]
- [ ] Feature flag `tasks_parent_collapse` for staged rollout [jira:TASKS-XXX]

## API/Schema & Types Impact

- UI Types: `TaskHierarchyInfo` fields `hasChildren: boolean`, `childrenTotal: number`, `childrenDone: number` [spec:UI-Types]
- Services:
  - `searchAllUserTasks({ onlyParents: true, ...filters, cursor, limit })` maps aggregates [spec:UI-Service]
  - `fetchTaskChildren(parentId, filters)` → calls `children-tasks` endpoint with cursor/limit [spec:UI-Service]
- React Query: separate keys for parents vs children per parent `['tasks','children', parentId, filters]` [spec:UI-Data]
- Backend:
  - Add `onlyParents` handling and compute aggregates under filters (decide filtered vs absolute) [spec:API]
  - Implement `children-tasks` endpoint returning TaskDto list with cursor; enforce same filters/permissions [spec:API]

### Proposed Endpoint Shapes

- Parent search (list):
  - Request: `GET /tasks/search?onlyParents=true&cursor=&limit=&projectIds=&assignee=&query=&status=`
  - Response item: `TaskDto & { hasChildren: boolean; childrenTotal: number; childrenDone: number }`
- Kanban per column:
  - Request: `GET /tasks/board?onlyParents=true&status=TODO|IN_PROGRESS|DONE&cursor=&limit=&...filters`
  - Response item: same aggregates as above
- Children by parent:
  - Request: `GET /projects/:projectId/tasks/:parentTaskId/children-tasks?cursor=&limit=&...filters`
  - Response: `{ items: TaskDto[], nextCursor: string | null, total?: number }`

## UX Acceptance Criteria & Test Plan

- [ ] By default, list and kanban display only parents; no children visible until expanded.
- [ ] Parent shows child progress badge matching agreed definition of done.
- [ ] Expanding loads children lazily and is reversible; state persists across navigation within the same filters.
- [ ] Filters affect both parent visibility and which children are shown; badge semantics are consistent with spec.
- [ ] A11y: disclosure controls operable via keyboard, with ARIA expanded state; screen readers announce counts.
- [ ] Performance: expanding up to 50 children does not exceed 120ms main-thread work P95 on mid devices.

## Risks & Mitigations

- Badge semantics confusion between filtered vs absolute counts — document and choose one; consider dual tooltip.
- Payload bloat when expanding many parents — paginate children per parent; limit concurrent expansions.
- State explosion in URL — compress or cap number of expanded parents; fallback to session storage.
- DnD complexity with nested items — gate advanced reparenting; limit scope in v1.

## Rollout & Feature Flags

- Flag: `tasks_parent_collapse` controlling parent-only mode and expansion UI.
- Gradual rollout: internal → 10% → 100%; monitor interaction metrics and error rates.
- Metrics: expand/collapse usage, time-to-first-expand, child fetch error rate, badge click rate.

## Definition of Done

- [ ] List and Kanban default to parent-only, with working expand/collapse.
- [ ] Accurate and consistent child progress badges.
- [ ] Lazy loading of children with pagination; error and empty states handled.
- [ ] A11y verified; unit and E2E tests passing.
- [ ] Docs updated; feature flag and metrics in place.

## Changelog

- 2025-09-22: Initial draft.
