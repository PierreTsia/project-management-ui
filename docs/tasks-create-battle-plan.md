# Task Creation from Tasks Page - Battle Plan

## 🎯 Story

**As a user, in the Tasks page, I want to be able to create a new task using the existing create task CTA button**

## 📋 Current State Analysis

### ✅ What We Have

- **Existing Create Task Modal**: `src/components/projects/CreateTaskModal.tsx`
  - Uses React Hook Form with Zod validation
  - Shadcn Form components (`<Form>`, `<FormField>`, etc.)
  - Complete form with: title, description, priority, dueDate, assigneeId
  - Already integrated in ProjectDetail page
  - Uses `useCreateTask` hook for API calls

- **Tasks Page Structure**: `src/pages/Tasks.tsx`
  - Has a "Create Task" button (lines 214-223) but no functionality
  - Uses global task search and display
  - Supports both table and kanban views

- **User Projects Hook**: `src/hooks/useProjects.ts`
  - `useProjects()` hook available for fetching user's projects
  - Returns projects with proper typing

### 🔍 Key Differences from Project Detail

- **Project Selection**: Need to add async select for user's projects
- **Context**: Global tasks page vs project-specific page
- **Navigation**: After creation, stay on tasks page vs navigate to project
- **API Requirement**: `projectId` is **required** for the POST call to work

## 🎨 Design Decision: Modal vs Page

### ✅ **Recommendation: Modal Approach**

**Why Modal:**

- **Consistency**: Matches existing pattern in ProjectDetail page
- **UX**: Quick task creation without losing context of current tasks view
- **Reusability**: Can reuse existing `CreateTaskModal` with minimal modifications
- **Performance**: No additional route/page to maintain

**Modal Implementation:**

- Extend existing `CreateTaskModal` to support global task creation
- Add project selection as first field
- Keep all existing form fields and validation

## 🚀 Implementation Plan

### Phase 1: Extend CreateTaskModal Component

**File**: `src/components/projects/CreateTaskModal.tsx`

#### Changes Needed:

1. **Add Project Selection Field**

   ```typescript
   // Add to schema
   projectId: z.string().min(1, 'tasks.create.validation.projectRequired'),

   // Add to form
   <FormField
     control={form.control}
     name="projectId"
     render={({ field }) => (
       <FormItem>
         <FormLabel>{t('tasks.create.projectLabel')}</FormLabel>
         <Select onValueChange={field.onChange} value={field.value}>
           <FormControl>
             <SelectTrigger>
               <SelectValue placeholder={t('tasks.create.projectPlaceholder')} />
             </SelectTrigger>
           </FormControl>
           <SelectContent>
             {userProjects?.map(project => (
               <SelectItem key={project.id} value={project.id}>
                 {project.name}
               </SelectItem>
             ))}
           </SelectContent>
         </Select>
         <FormMessage />
       </FormItem>
     )}
   />
   ```

2. **Make ProjectId Required for Global Mode**
   - When no `projectId` prop provided (global mode), project selection is **required**
   - When `projectId` prop provided (project mode), hide project selector
   - Update form validation to make projectId required in global mode

3. **Add User Projects Hook**
   ```typescript
   const { data: userProjects } = useProjects();
   ```

### Phase 2: Update Tasks Page

**File**: `src/pages/Tasks.tsx`

#### Changes Needed:

1. **Add Modal State**

   ```typescript
   const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
   ```

2. **Connect Button to Modal**

   ```typescript
   <Button
     size="sm"
     className="w-9 h-9 p-0 sm:w-auto sm:h-9 sm:px-3"
     aria-label={t('tasks.create.submit')}
     onClick={() => setShowCreateTaskModal(true)} // Add this
   >
   ```

3. **Add Modal Component**
   ```typescript
   <CreateTaskModal
     isOpen={showCreateTaskModal}
     onClose={() => setShowCreateTaskModal(false)}
     // No projectId prop = global mode
   />
   ```

### Phase 3: Update Translations

**Files**: `src/locales/en.json`, `src/locales/fr.json`

#### New Translation Keys:

```json
{
  "tasks": {
    "create": {
      "projectLabel": "Project",
      "projectPlaceholder": "Select a project",
      "validation": {
        "projectRequired": "Project is required"
      }
    }
  }
}
```

### Phase 4: Update Task Creation Hook

**File**: `src/hooks/useTasks.ts`

#### Changes Needed:

1. **Ensure Global Task Creation Support**
   - Verify `useCreateTask` works with projectId from form
   - Check if API supports global task creation

2. **Update Cache Invalidation**
   - After task creation, invalidate global tasks query
   - Ensure new task appears in current view

## 🔧 Technical Implementation Details

### Component Props Interface

```typescript
type CreateTaskModalProps = {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string; // Optional - if provided, hide project selector
};
```

### Form Schema Updates

```typescript
// Base schema for project mode (projectId provided)
const baseCreateTaskSchema = z.object({
  title: z
    .string()
    .min(2, 'tasks.create.validation.titleMinLength')
    .max(255, 'tasks.create.validation.titleMaxLength'),
  description: z
    .string()
    .max(5000, 'tasks.create.validation.descriptionMaxLength')
    .optional(),
  priority: z.enum(TASK_PRIORITIES).optional(),
  dueDate: z.date().optional(),
  assigneeId: z.string().optional(), // Optional per API contract
});

// Global mode schema (projectId required)
const globalCreateTaskSchema = baseCreateTaskSchema.extend({
  projectId: z.string().min(1, 'tasks.create.validation.projectRequired'),
});

// Use conditional schema based on mode
const createTaskSchema = projectId
  ? baseCreateTaskSchema
  : globalCreateTaskSchema;
```

### Conditional Rendering Logic

```typescript
// In CreateTaskModal component
const showProjectSelector = !projectId;
const formSchema = showProjectSelector
  ? globalCreateTaskSchema
  : baseCreateTaskSchema;

// Form submission logic
const handleSubmit = async (data: CreateTaskFormData) => {
  const taskData: CreateTaskRequest = {
    title: data.title,
    ...(data.description && { description: data.description }),
    ...(data.priority && { priority: data.priority }),
    ...(data.dueDate && { dueDate: data.dueDate.toISOString() }),
    ...(data.assigneeId && { assigneeId: data.assigneeId }), // Optional per API
  };

  // Use projectId from prop or form data
  const targetProjectId = projectId || data.projectId;

  await createTask({
    projectId: targetProjectId, // Required in URL path
    data: taskData,
  });
};
```

## 🧪 Testing Strategy

### Unit Tests

- Test form validation with/without projectId
- Test project selection functionality
- Test form submission with different scenarios

### Integration Tests

- Test modal opening/closing from Tasks page
- Test task creation flow end-to-end
- Test cache invalidation after creation

### E2E Tests

- User can open create task modal from Tasks page
- User can select project and create task
- New task appears in tasks list after creation

## 📝 Acceptance Criteria

### ✅ Must Have

- [ ] Create Task button opens modal on Tasks page
- [ ] Modal shows project selection dropdown
- [ ] All existing form fields work (title, description, priority, dueDate, assignee - optional)
- [ ] Form validation works for all fields including project selection
- [ ] Task is created successfully and appears in tasks list
- [ ] Modal closes after successful creation
- [ ] Error handling for failed creation

### 🎯 Nice to Have

- [ ] Project dropdown shows project names clearly
- [ ] Form remembers last selected project
- [ ] Loading states during creation
- [ ] Success toast notification

## 🚨 Potential Challenges & Solutions

### Challenge 1: Form Validation Complexity

**Problem**: Conditional validation based on projectId prop - projectId is required for API but optional in project mode
**Solution**: Use separate schemas - `globalCreateTaskSchema` (with required projectId) vs `baseCreateTaskSchema` (without projectId)

### Challenge 2: Assignee Selection

**Problem**: Need to fetch contributors for selected project
**Solution**: Use `useProjectContributors` hook when project changes

### Challenge 3: Cache Management

**Problem**: Ensuring new task appears in global tasks list
**Solution**: Proper query invalidation in useCreateTask hook

## 📊 Success Metrics

- Task creation success rate > 95%
- User can create task in < 30 seconds
- No regression in existing ProjectDetail task creation
- All form validations work correctly

## 🎉 Next Steps

1. Implement Phase 1 (extend CreateTaskModal)
2. Implement Phase 2 (update Tasks page)
3. Add translations (Phase 3)
4. Test thoroughly
5. Deploy and monitor

---

**Estimated Effort**: 4-6 hours
**Risk Level**: Low (reusing existing patterns)
**Dependencies**: None (all required hooks/services exist)
