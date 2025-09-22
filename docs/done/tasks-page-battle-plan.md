# Tasks Page Battle Plan

## 🎯 Mission Statement

Build a dynamic, user-centric tasks page (`/tasks`) that allows users to view, filter, and manage all their tasks across projects with Table/Board views and future Gantt support.

## 📊 Current State Analysis

### ✅ What We Have (API)

- **Project-scoped task endpoints** - All CRUD operations per project
- **Basic search/filtering** - Status, priority, assignee, text search
- **Task entity** - Complete with status, priority, due date, assignee
- **Comments system** - Full CRUD for task comments
- **Pagination** - Basic page/limit support

### ❌ Critical Gaps (API)

- **No global task endpoints** - All endpoints are project-scoped
- **Limited filtering** - No date ranges, project filtering, advanced sorting
- **No bulk operations** - Can't update multiple tasks at once
- **No task statistics** - No counts, grouping, or analytics

### ❌ Missing (Frontend)

- **No tasks page** - Empty route at `/tasks`
- **No global task management** - Users must navigate project by project
- **No view switching** - No Table/Board toggle
- **No saved views** - No personal/team view presets

## 🚀 Battle Plan

### Phase 1: Foundation (Week 1-2)

**Goal:** Get basic global task viewing working

#### Backend Tasks

1. **Create Global Tasks Controller**
   - `GET /tasks` - Get all user's tasks across projects
   - `GET /tasks/search` - Enhanced search with project filtering
   - Add project access validation (user must be contributor)

2. **Enhance Search DTOs**
   - Add `projectId` filter to search
   - Add `dueDateFrom`/`dueDateTo` range filtering
   - Add `sortBy`/`sortOrder` options
   - Add `assigneeId` filtering (me/any user)

3. **Update Tasks Service**
   - Add `findAllUserTasks()` method
   - Add `searchAllUserTasks()` method
   - Implement cross-project querying with proper permissions

#### Frontend Tasks

1. **Create Tasks Page Structure**
   - `/src/pages/Tasks.tsx` - Main page component
   - `/src/components/tasks/` - Task-specific components
   - `/src/hooks/useTasks.ts` - Enhanced hook for global tasks

2. **Build Table View (MVP)**
   - Basic table with columns: Title, Project, Status, Priority, Due Date, Assignee
   - Row selection for bulk actions
   - Inline status updates
   - Pagination

3. **Add Basic Filtering**
   - Project dropdown filter
   - Status filter chips
   - Priority filter chips
   - Assignee filter (me/any user)
   - Due date range picker

### Phase 2: Enhanced UX (Week 3-4)

**Goal:** Add Board view, saved views, and better UX

#### Backend Tasks

1. **Add Bulk Operations**
   - `PUT /tasks/bulk/status` - Bulk status updates
   - `PUT /tasks/bulk/assign` - Bulk assignment
   - `DELETE /tasks/bulk` - Bulk deletion

2. **Add Task Statistics**
   - `GET /tasks/stats` - Counts by status, priority, project
   - Add task grouping capabilities

#### Frontend Tasks

1. **Build Board View (Kanban)**
   - Columns by status (TODO, IN_PROGRESS, DONE)
   - Drag & drop with `@dnd-kit`
   - Card design with project, assignee, due date
   - WIP limits (future)

2. **Add View Switching**
   - Toggle between Table/Board views
   - Persist view preference in localStorage
   - URL state management

3. **Implement Saved Views**
   - "My Open Tasks" (default)
   - "Overdue Tasks"
   - "By Project" views
   - Save/load view presets

4. **Add Bulk Actions**
   - Multi-select with checkboxes
   - Bulk status change dropdown
   - Bulk assign to me
   - Bulk delete with confirmation

### Phase 3: Polish & Advanced Features (Week 5-6)

**Goal:** Production-ready with advanced features

#### Backend Tasks

1. **Add Advanced Filtering**
   - Date range filtering for created/updated
   - Tag-based filtering (future)
   - Custom field filtering (future)

2. **Add Task Analytics**
   - Task completion rates
   - Average time to completion
   - Workload distribution

#### Frontend Tasks

1. **Add Advanced Features**
   - Task details drawer/sidebar
   - Quick actions (assign to me, mark done)
   - Keyboard shortcuts
   - Export functionality

2. **Add Performance Optimizations**
   - Virtual scrolling for large lists
   - Optimistic updates
   - Smart caching strategies

3. **Add Accessibility**
   - ARIA labels and roles
   - Keyboard navigation
   - Screen reader support

### Phase 4: Future Enhancements (Week 7+)

**Goal:** Advanced features and Gantt view

#### Backend Tasks

1. **Add Gantt Support**
   - Task dependencies
   - Timeline calculations
   - Resource allocation

2. **Add Team Features**
   - Shared saved views
   - Team task templates
   - Workload management

#### Frontend Tasks

1. **Add Gantt View**
   - Timeline visualization
   - Dependency management
   - Resource allocation view

2. **Add Team Features**
   - Team task boards
   - Shared views
   - Collaboration tools

## 🛠 Technical Implementation Details

### API Endpoints to Create

```typescript
// Global Tasks
GET / tasks;
GET / tasks / search;
GET / tasks / stats;

// Bulk Operations
PUT / tasks / bulk / status;
PUT / tasks / bulk / assign;
DELETE / tasks / bulk;

// Future
GET / tasks / gantt;
GET / tasks / analytics;
```

### Frontend Architecture

```
src/pages/Tasks.tsx
├── src/components/tasks/
│   ├── TaskTable.tsx
│   ├── TaskBoard.tsx
│   ├── TaskCard.tsx
│   ├── TaskFilters.tsx
│   ├── TaskBulkActions.tsx
│   └── TaskDetailsDrawer.tsx
├── src/hooks/
│   ├── useTasks.ts (enhanced)
│   ├── useTaskFilters.ts
│   └── useTaskViews.ts
└── src/types/
    ├── task.types.ts
    └── task-filter.types.ts
```

### State Management

- **URL State**: Filters, view type, pagination
- **Local State**: Selected tasks, view preferences
- **Server State**: Tasks data, filters, pagination
- **Cache**: React Query for optimistic updates

### Performance Considerations

- **Virtual Scrolling**: For large task lists
- **Optimistic Updates**: Immediate UI feedback
- **Smart Caching**: Avoid unnecessary API calls
- **Lazy Loading**: Load task details on demand

## 📋 Acceptance Criteria

### Phase 1 (MVP)

- [x] Users can view all their tasks across projects
- [x] Basic filtering by project, status, priority, assignee
- [x] Table view with essential columns
- [x] Pagination works smoothly
- [x] Inline status updates work
- [-] Mobile responsive

### Phase 2 (Enhanced)

- [x] Board view with drag & drop
- [x] View switching preserves filters
- [x] Saved views work (save/load)
- [x] Bulk actions work
- [ ] URL state management
- [ ] Keyboard navigation

### Phase 3 (Production)

- [ ] Task details drawer
- [ ] Advanced filtering options
- [ ] Performance optimized
- [ ] Accessibility compliant
- [ ] Error handling
- [ ] Loading states

## 🚨 Risks & Mitigations

### Technical Risks

1. **Performance with large datasets**
   - _Mitigation_: Virtual scrolling, pagination, smart caching
2. **Complex state management**
   - _Mitigation_: URL state, React Query, clear separation of concerns
3. **Drag & drop complexity**
   - _Mitigation_: Use proven library (@dnd-kit), start simple

### UX Risks

1. **Overwhelming interface**
   - _Mitigation_: Progressive disclosure, saved views, smart defaults
2. **Mobile experience**
   - _Mitigation_: Mobile-first design, responsive breakpoints
3. **Learning curve**
   - _Mitigation_: Intuitive design, tooltips, onboarding

## 🎯 Success Metrics

### User Engagement

- Time spent on tasks page
- Task completion rate
- View switching frequency
- Saved view usage

### Performance

- Page load time < 2s
- Task list render < 100ms
- API response time < 500ms
- 95th percentile performance

### Quality

- Zero critical bugs
- 100% accessibility score
- 90%+ test coverage
- User satisfaction > 4.5/5

## 📅 Timeline

| Phase   | Duration | Key Deliverables                      |
| ------- | -------- | ------------------------------------- |
| Phase 1 | 2 weeks  | Global tasks API, basic table view    |
| Phase 2 | 2 weeks  | Board view, saved views, bulk actions |
| Phase 3 | 2 weeks  | Polish, performance, accessibility    |
| Phase 4 | Ongoing  | Gantt view, team features             |

## 🚀 Next Steps

We are ready to merge the current Tasks page work. Immediately after merge, prioritize:

1. **Implement Create Task button**
   - Wire the header button in `src/pages/Tasks.tsx` to open a create task flow (modal or route)
   - Support project selection when creating from global view
   - Optimistically update global lists and invalidate caches

2. **UI/UX refinements**
   - Polish filters panel animations and spacing
   - Improve empty states, error messages, and loading indicators
   - Align copy with i18n keys and audit for consistency
   - Accessibility pass on filters, table controls, and bulk actions

3. **Data table refinement**
   - Column sizing, truncation, and responsiveness polish
   - Sticky header and row hover/selection affordances
   - Keyboard navigation and focus management
   - Consider virtualization for large datasets

4. **Operational**
   - Monitor for perf regressions and error rates post-merge
   - Gather user feedback; iterate on pain points

---

_This battle plan is a living document. Update as we learn and iterate._
