Settings Page Revamp (UI-SET-001)

## References

- API: `src/users/users.controller.ts`, `src/auth/auth.controller.ts`
- UI: `src/pages/Settings.tsx`

## Summary & Scope

- Build a functional Settings page replacing the placeholder with account profile, password update, avatar upload, and basic preferences (theme). Exclude advanced security (2FA, sessions) and granular notifications for now.

## Assumptions & Constraints

- Authenticated users only; uses existing JWT flow.
- Email changes require confirmation flow (not yet implemented) — deferred.
- Theme preference is client-side for MVP (persist later).
- Email change is out of scope for v1.
- Notification preferences are out of scope for MVP.

## Open Questions (Blocking)

- [ ] None currently.

## Incremental Plan

### Phase 0 — Groundwork

- [ ] Add API client methods: `GET /users/whoami`, `PATCH /users/profile`, `POST /users/avatar`, `PUT /auth/password`
- [ ] Add types: `UserProfile` aligned to API (`id, email, name, bio, avatarUrl`)
- [ ] Wire `useUser` hook (ensure it exposes refresh/invalidate)

### Phase 1 — Profile Details (Highest Value)

- [x] Render current user (name, email, bio, avatar) using `GET /users/whoami`
- [-] Edit name and bio; submit via `PATCH /users/profile`
- [x] Show email as read-only for now; add hint about upcoming email-change flow
- [x] Success/error toasts; optimistic UI with invalidate on success

### Phase 2 — Password Update (High Value)

- [ ] Add form: current, new, confirm; client-side validation
- [ ] Submit to `PUT /auth/password` with i18n messages
- [ ] Handle server validation codes; clear fields on success

### Phase 3 — Avatar Upload (High Value)

- [x] Add avatar uploader with preview; accept common image types
- [x] Submit multipart to `POST /users/avatar`
- [x] Update user context/avatar across app after success
- [x] Validate client-side: allow `image/jpeg`, `image/png`, `image/webp`; max size 2 MB; show inline error and prevent submit

### Phase 4 — Appearance (Medium Value)

- [ ] Add theme toggle; integrate with existing theme provider if present
- [ ] Persist theme to localStorage; plan API persistence later

### Phase 5 — Notifications (Later)

- [ ] Design preferences model (email, push, task reminders)
- [ ] Decide persistence target (API vs local) [blocked]

## API/Schema & Types Impact

**Existing endpoints (can use now):**

- GET `users/whoami` — current user profile
- PATCH `users/profile` — update `name` (and potentially `bio` with minor BE change)
- POST `users/avatar` — avatar upload via multer/Cloudinary
- PUT `auth/password` — update password

**Likely missing or to extend (to reach target vision):**

- [ ] PATCH `users/profile` to accept `bio` (currently UpdateNameDto only)
- [ ] PATCH `users/email` (start email-change flow with confirmation)
- [ ] GET/PUT `users/preferences` (theme, notifications) — new model/table/columns
- [ ] GET `auth/sessions` and DELETE `auth/sessions/:id` for session/device management (future)
- [ ] POST `auth/2fa/setup`, POST `auth/2fa/verify`, DELETE `auth/2fa` (future)

### Backend Follow-up Task (Deferred)

- [ ] Migrate from `UpdateNameDto` to `UpdateUserProfileDto` and consolidate profile update
  - Controller: keep route `PATCH /users/profile`, switch body to `UpdateUserProfileDto`
  - DTO fields: `name` (required), `bio?`, `phone?`, `dob?` (ISO date string) with validations
  - Service: rename `updateName` -> `updateProfile`, persist provided fields (partial updates)
  - Backward compatibility: accept legacy `UpdateNameDto` payload during transition
  - Tests: controller/service unit tests for partial updates, validation, i18n errors
  - Docs: update Swagger annotations and API reference

## UX Acceptance Criteria & Test Plan

- [ ] Given I open Settings, I see my current profile and avatar
- [ ] When I update name/bio, I see success and data persists
- [ ] When I submit correct current/new password, I see success and fields clear
- [ ] When I upload a valid avatar, header avatar updates without reload
- [ ] Theme toggle persists across reloads
- [ ] Empty/error states localized via i18n
- [ ] Avatar upload rejects files over 2 MB or invalid types with a clear message

## Risks & Mitigations

- Profile DTO mismatch (bio not supported) → add BE field or split endpoint
- Large image uploads/timeouts → limit size and show progress
- Password errors expose details → rely on i18n codes and generic messages

## Rollout & Feature Flags

- Hide email-change and notifications behind code flags; ship Profile+Password+Avatar first

## Definition of Done

- [ ] Profile edit, password update, avatar upload fully functional with tests
- [ ] Types aligned; no `any`; strict TS passes
- [ ] i18n keys added and covered in tests
- [ ] UI accessible (labels, focus, error descriptions)
- [ ] FE avatar validation enforces file type and size constraints

## Changelog

- 2025-09-17: Initial draft.
