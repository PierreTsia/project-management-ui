### Tech Debt Log

- TaskFilters memoization workaround
  - Context: To stop a render loop (Maximum update depth) triggered by Radix Select re-initialization after applying filters, `TaskFilters` is wrapped in `React.memo` with a comparator that always returns true.
  - Impact: Prevents legitimate parent-driven re-renders of the filters panel. Works because the component manages its own local state and only sends changes upward via Apply/Clear, but it is not idiomatic and could hide future sync needs.
  - Evidence: Loop reproduced when applying filters with a non-default Select value, stack traced to Radix compose-refs setRef during layout. Fix confirmed by freezing re-renders.
  - Follow-ups (preferred path):
    1. Stabilize parent props: wrap `onFiltersChange` in `useCallback`, avoid recreating `filters` object each render; only change a `filtersKey` when an intentional reset is needed.
    2. Replace the always-true comparator with a shallow comparator on props that matter.
    3. Consider upgrading `@radix-ui/react-select` to latest patch; known ref loops have been fixed in some versions.
    4. If still flaky, swap to simpler Combobox/native `<select>` for filters or isolate the Selects behind a memoized subtree.
  - Owners: Frontend
  - Created: 2025-09-16

- Global Invite Modal email lookup functionality
  - Context: The GlobalInviteModal currently has placeholder code for email lookup functionality that would show user name/avatar when typing an email address.
  - Impact: Missing UX enhancement that would help users verify they're inviting the right person before submitting.
  - Evidence: Code is commented out in `src/components/team/GlobalInviteModal.tsx` with TODO comments.
  - Follow-ups (preferred path):
    1. Backend: Create API endpoint `GET /users/lookup?email=...` that returns user info (name, avatar) for existing users.
    2. Frontend: Implement debounced email lookup with proper error handling and loading states.
    3. Consider rate limiting the lookup endpoint to prevent abuse.
    4. Add proper TypeScript types for the lookup response.
  - Owners: Backend + Frontend
  - Created: 2025-01-27
