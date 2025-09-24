## Task Description: Markdown Editor & Renderer (No DB Change)

### Summary

- Replace plain text description with a lightweight Markdown editor (textarea) and renderer.
- Store Markdown as a string in existing `tasks.description` text column. No schema change.

### Decisions

- **Editor**: simple `<textarea>` with Preview toggle. No heavy RTE.
- **Renderer**: react-markdown + remark-gfm; disable raw HTML.
- **Storage**: Markdown string; existing `Task.description?: string` stays.
- **Security**: ignore HTML nodes in renderer; no HTML injection.

### Scope

- Update `TaskDescriptionSection` to use Markdown editor/preview and save Markdown string.
- Keep API contracts unchanged (`CreateTaskRequest/UpdateTaskRequest.description: string`).
- Add i18n strings for labels and toasts.
- Update tests for render/edit/preview/save.

### Acceptance Criteria

- Viewing a task shows rendered Markdown (GFM basics: lists, links, emphasis, code, tables).
- Toggle to Edit shows textarea with current Markdown and Preview mode.
- Save persists Markdown to `description` via existing update endpoint.
- No XSS via raw HTML; HTML content is ignored.
- Existing plain text descriptions render fine.

### Out of Scope

- Rich text toolbars, slash menus, or JSON editor state.
- Database migrations or new columns.
- Image uploads; image links render if provided.

### UX Details

- Modes: Edit | Preview. Default to Edit when user clicks "Add description".
- Optional character count and soft limit (e.g., 20k chars).
- Keyboard: Ctrl/Cmd+Enter saves; Esc cancels (if applicable).

### Engineering Notes

- Renderer: `react-markdown` with `remark-gfm` and HTML disabled (`skipHtml`).
- Consider lazy import of renderer to reduce bundle cost on initial load.
- For code blocks, optional future enhancement: syntax highlighting via rehype plugins (deferred).

### Testing

- Unit: render Markdown (headings, lists, links), preview toggle, save flow, empty state.
- Integration: update mutation triggers success toast, error toast on failure, state updates.

### Risks & Mitigations

- Security (HTML/XSS): disable HTML rendering; validate links.
- Performance for very long descriptions: lazy renderer, virtualization not required initially.

### Rollout

- Behind minor UI flag (optional). No data migration.
- Document Markdown support in a small help tooltip or docs link.

### References

- RTE context considered but not chosen: shadcn/editor installation
  - https://shadcn-editor.vercel.app/docs/installation
