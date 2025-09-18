# Team Page – Battle Plan

## 🎯 Goal

Build a global Team page that aggregates all contributors across the projects the current user can access. No new entity is introduced on the backend; we aggregate from existing project contributors and users. Team page provides discovery, filtering and navigation to project-level contributor management.

## 🧩 Scope

- Aggregated read-only overview at `/team` with search, filters, sorting, and pagination
- Per-contributor detail panel listing shared projects and quick navigation to each project’s Contributors page
- All mutations (add/remove/change role) remain at project-level pages

## 🛠 Backend API – Required Additions (No New Entity)

Implement a small read-side aggregation over existing `project_contributors` and `users`. Keep authorization identical to projects/tasks: only projects where the current user is owner or contributor.

Endpoints (proposed):

1. GET `/contributors`

- Purpose: Return unique users who are contributors across any projects the current user can access
- Query params:
  - `q?: string` – text search on name/email
  - `role?: READ|WRITE|ADMIN|OWNER|any` (default: any)
  - `projectId?: string` – narrow to a single project
  - `includeArchived?: boolean` (default: true)
  - `sort?: name|joinedAt|projectsCount` (default: name)
  - `order?: asc|desc` (default: asc)
  - `page?: number` (default: 1)
  - `pageSize?: number` (default: 20)
- Response item (aggregated by user):
  - `user`: `{ id, name, email, avatarUrl }`
  - `projectsCount`: number
  - `projectsPreview`: `{ id, name, role }[]` (first N, e.g. 5)
  - `projectsOverflowCount`: number
  - `roles`: distinct set of roles across projects

2. GET `/contributors/:userId/projects`

- Purpose: List all shared projects (between viewer and target contributor) with their role in each
- Response: `{ projectId, name, role }[]`

Implementation approach (service):

- Compute accessible projectIds for current user (owned OR contributor)
- Query `project_contributors` join `user` and `project` with `project_id IN (...)`
- Apply filters in SQL where possible; aggregate by `user_id` in service
- No DB migrations required; an optional DB view can be introduced later for performance

Auth & i18n:

- Auth required; scope by accessible projectIds
- Use `accept-language` for error messages only

DTOs (sketch):

- `ListContributorsQueryDto`
- `ContributorAggregateResponseDto`
- `ContributorProjectsResponseDto`

Backend integration notes (as merged in 2bb25ff):

- `includeArchived` is NOT implemented. Do not expose this filter on FE for v1.
- `projectsOverflowCount` is NOT returned. FE will compute overflow locally when slicing previews.
- Pagination is by distinct userIds, then aggregating rows for those users. This meets FE needs.
- Sorting:
  - `name` and `joinedAt` are applied pre-aggregation for the userId set; `projectsCount` is applied post-aggregation in-memory.
  - `joinedAt` represents contributor join timestamps across projects; ordering is stable for the chosen userId set.

## 🖥 Frontend Plan

Route:

- `/team` (global overview)

UI Structure:

- Header: title, search input, role filter, optional project filter, sort, pagination
- Results: responsive cards or table rows
  - Avatar, name, email
  - Role chips (deduped), projectsCount
  - Actions: “View shared projects” (opens side panel); “Manage in project” deep-links
- Side panel: list shared projects `{name, role}` + link to `/projects/:projectId/contributors`

Global Invite CTA:

- Add a primary “Invite user” button in the header
- Opens a global `InviteContributorModal` that reuses existing project invite flow with an added Project selector
- Fields:
  - `projectId` (required) – select from projects where current user has ADMIN
  - `email` (required)
  - `role` (required: ADMIN|WRITE|READ)
- Behavior:
  - Submit calls existing `useAddContributor` mutation with `{ projectId, data: { email, role } }`
  - On success: close modal, show success toast, and optionally refetch contributors list
  - Validation errors surfaced via existing error mapping
- UX Enhancements:
  - Preselect last used project (persist `lastInvitedProjectId` in localStorage)
  - Debounce email input (300ms) for live “user exists” lookup and to avoid chatty validations
  - If email matches an existing user, show name/avatar preview (non-blocking)
  - Disable submit while loading, show inline errors, keep role selection sticky

React Query Hooks:

- `useContributors(params)` → GET `/contributors`
- `useContributorProjects(userId)` → GET `/contributors/:userId/projects`
- `useProjects()` to populate project selector (filter to ADMIN projects)

Hook contracts and caching:

- Define `ContributorsParams` { q?, role?, projectId?, sort?, order?, page?, pageSize? }.
- Build query key as `['contributors', params]` with stable serialization; use keepPreviousData during pagination.
- Map response to `{ data: contributors, page, limit, total }`.
- Side panel projects query key: `['contributor-projects', userId]`; cacheTime >= 5m, staleTime 60s.

Translations (add to `en.json` / `fr.json`):

- `team.title`
- `team.searchPlaceholder`
- `team.filters.role`
- `team.filters.project`
- `team.sort.name`, `team.sort.joinedAt`, `team.sort.projectsCount`
- `team.noResults`
- `team.projectsShared`
- `team.viewSharedProjects`
- `team.manageInProject`
- `team.invite.title` – Invite user
- `team.invite.projectLabel` – Project
- `team.invite.projectPlaceholder` – Select a project
- `team.invite.emailLabel` – Email
- `team.invite.roleLabel` – Role
- `team.invite.submit` – Invite
- `team.invite.emailExistsHint` – We found an existing user
- `team.invite.loading` – Inviting…
- `team.invite.success` – Invitation sent
- `team.empty` – No contributors found
- `team.error` – Could not load contributors

Accessibility/Theme:

- Follow shadcn theme, keyboard focus states, proper table semantics when using table layout

Preview and overflow handling:

- FE constant `PROJECTS_PREVIEW_LIMIT = 5` for card rendering.
- Compute `projectsOverflowCount = Math.max(0, projectsPreview.length - PROJECTS_PREVIEW_LIMIT)`.
- Render first N chips and a “+X” overflow chip.

## ✅ Acceptance Criteria

- GET `/contributors` returns unique contributors scoped to user’s accessible projects, with pagination and filters
- Team page lists contributors with search by name/email, role filtering and name sorting
- Clicking a contributor reveals shared projects and links to project-level contributor management
- Header contains a “Invite user” CTA that opens a modal with project select, email, and role
- Inviting from Team page creates a contributor in the selected project (requires ADMIN) and refreshes relevant lists
- No role edits occur on the Team page; edits are done under `/projects/:projectId/contributors`
- All Team UI strings translated (en/fr); page looks correct in light and dark themes

## 🔄 Navigation & Ownership of Mutations

- Global Team: discovery and navigation
- Project Contributors: add/remove/change role (existing flows reused)

## 🧪 Testing Strategy

Backend:

- Unit tests for service aggregation (filters, sort, pagination, scoping)
- Controller tests for param validation and auth scoping

Frontend:

- Component tests: search, role filter, empty states, side panel
- Integration test: fetch contributors, open projects panel, navigate to project contributors page

## 🚚 Delivery Steps

Backend (api repo):

1. Add `contributors` controller/service (or under projects as read-only endpoints)
2. Implement GET `/contributors` and GET `/contributors/:userId/projects` with DTOs and tests

Frontend (ui repo):

1. Add `/team` route and Team page
2. Implement `useContributors` and `useContributorProjects` hooks
3. Build UI (search, filters, list, side panel, Invite modal with project selector) with i18n and dark mode
4. Link to `/projects/:projectId/contributors` for management

## 📦 Implementation Subtasks

### Backend subtask: Contributors aggregation API

- [x] Set up module
  - [x] Create `contributors` module (controller, service) or add read-only endpoints under `projects` module; prefer separate `contributors` for clarity
  - [x] Wire into `app.module.ts`
- [x] Define DTOs
  - [x] `ListContributorsQueryDto`: `q?`, `role?`, `projectId?`, `includeArchived?`, `sort?`, `order?`, `page?`, `pageSize?` with class-validator rules
  - [x] `ContributorAggregateResponseDto`: `user`, `projectsCount`, `projectsPreview[]`, `roles[]`
  - [x] `ContributorProjectsResponseDto[]`: `projectId`, `name`, `role`
- [x] Implement service logic
  - [x] Resolve accessible `projectIds` for the current user (owned OR contributor)
  - [x] Query `project_contributors` join `user` and `project` filtered by `projectIds`
  - [x] Apply filters: text search on user name/email; role; optional `projectId`; `includeArchived`
  - [x] Sorting: `name` (user), `joinedAt` (contributor), `projectsCount` (post-aggregation)
  - [x] Aggregation: group by `userId` to compute `projectsCount`, distinct `roles`, `projectsPreview` (return all; FE may slice)
  - [x] Pagination: apply after aggregation (or use subquery/window functions if supported)
- [x] Implement controller
  - [x] GET `/contributors`: auth guard; parse `ListContributorsQueryDto`; return aggregated list with pagination meta
  - [x] GET `/contributors/:userId/projects`: auth guard; ensure target is within viewer’s accessible contributors; return shared projects list
  - [x] Respect `Accept-Language` for errors (plumbed to service)
- [x] Add tests
- [x] Service: empty states and pagination defaults
- [x] Controller: DTO wiring, auth override, return shapes
- [x] Docs & performance
- [x] Swagger docs for both endpoints
- [ ] Consider adding indexes on `project_contributors(project_id, user_id, role)`

### Frontend subtask: Team page with global invite

- [x] Routing and shell
  - [x] Add `/team` route; update main nav to include Team
  - [x] Create `TeamPage.tsx` with header, filters, results, side panel scaffolding
- [ ] Data hooks
  - [x] `useContributors(params)`: GET `/contributors` (q, role, projectId, sort, order, page, pageSize); keepPreviousData for pagination
  - [ ] `useContributorProjects(userId)`: GET `/contributors/:userId/projects` with caching (not needed for v1 since side panel was removed)
  - [x] Reuse `useProjects()` for filters and to derive ADMIN projects for invite modal
- [ ] Header & filters
  - [x] Debounced search input bound to `q` (500ms)
  - [x] Role select; optional project select
  - [ ] Sort select: name, joinedAt, projectsCount; pagination controls
  - [x] Do not surface `includeArchived` (not supported by API yet)
- [ ] Results list
  - [x] Show avatar, name, email, `projectsCount` (role chips deduped – deferred)
  - [x] Slice projects preview to N and render overflow chip
  - [x] Actions: deep-link to `/projects/:projectId` (side panel removed)
- [ ] Side panel
  - Removed for v1: redundant with clickable project chips on cards
- [ ] Global Invite modal
  - [ ] Header CTA “Invite user” opens modal
  - [ ] Fields: project select (ADMIN-only), email, role
  - [ ] Submit via `useAddContributor({ projectId, data })`; on success close, toast, refetch Team list with current params
  - [ ] UX: preselect last project (localStorage), debounce email (300ms), existing-user hint, loading/disabled states
- [ ] i18n
  - [ ] Add `team.*` and `team.invite.*` keys for labels, placeholders, messages
- [ ] Tests
  - [ ] Components: filters wiring, debounce, empty, error, and skeleton states
  - [ ] Integration: fetch contributors, open side panel, deep-link navigation; invite flow success/error
- [ ] Polish
  - [ ] Dark/light theme checks; keyboard nav and focus management in modal/panel

## ✅ Decisions

- Include users from archived projects by default: Yes (provide `includeArchived` to filter them out)
- Include OWNER as a role in aggregation: Yes
- Add tasks or activity counters now: No (defer to v2)
