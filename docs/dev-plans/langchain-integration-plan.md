# LangChain Integration for AI Features (LC-000)

## References

- LangChain JS v1-alpha — Messages: [docs.langchain.com — Messages](https://docs.langchain.com/oss/javascript/langchain/messages)
- Internal plan: `docs/dev-plans/generate-project-first-ai-tasks.md`
- UI: `src/components/projects/GenerateAiTasksModal.tsx`
- API: `src/ai/ai.controller.ts`, `src/ai/ai.service.ts` (and related: `src/ai/tools/task-generator.tool.ts`, `src/ai/utils/text.utils.ts`)

## Summary & Scope

- **Objective**: Introduce LangChain as the orchestration layer for current and future AI features (task generation, reasoning, tool use, structured output, streaming), standardizing message formats and enabling multi-turn capabilities.
- **In scope**: Incremental adoption for the "Generate Project First AI Tasks" flow, shared message/types alignment, structured output schemas, optional streaming UX, and test/observability hooks.
- **Out of scope**: Provider migration strategy beyond current models, full multi-agent systems, long-term memory stores; these can be follow-ups.

## Assumptions & Constraints

- TypeScript-first; strict typing for DTOs and structured outputs (no `any`).
- We will begin with LangChain v1-alpha message APIs for consistency across providers.
- UI prefers functional/immutable patterns and React best practices per repo rules.
- Backend uses NestJS modular architecture; integrations live under `ai/` domain.
- Latency budget for initial flows remains similar to current implementation; streaming is optional to keep initial risk low.

## Decisions (Confirmed)

- Provider: Use Mistral for v1; keep provider adapter so switching is trivial.
- Streaming: Disabled for v1; keep current buffered flow. Leave `LC_STREAMING` planned but off.
- Telemetry: Use the app logger for now; no external vendor. Revisit later.
- Output size: No explicit cap for v1; proceed as-is and observe.
- Conversation history: Single-shot requests; no persisted history for v1.

## Open Questions (Blocking)

- [ ] None for v1. Add here as new items arise.

## Contract Change Principle

- Minimize FE/BE API contract changes for v1. Any change must be explicitly justified and documented in this plan.

## Incremental Plan

### Phase 0 — Foundations (Groundwork)

- [ ] Add ADR summarizing LangChain adoption scope, tradeoffs, and phased rollout in `docs/` (depends on: Open Questions) [spec:this]
- [x] Add shared types for AI message DTOs and structured outputs in UI `src/types/ai.ts` and API `src/ai/dto/` with alignment (strict types, discriminated unions) [spec:this]
- [x] Introduce basic prompt/message conventions using LangChain Messages (System/Human/AI) aligned to v1-alpha [spec:LC Messages]
- [x] Create utility to map between our DTOs and LangChain `SystemMessage`/`HumanMessage`/`AIMessage` in API `ai/` (depends on: types) [spec:LC Messages]

### Phase 1 — Backend integration (single flow: Generate Project First AI Tasks)

- [x] Wrap model provider via `initChatModel` and bind to our service [spec:LC Messages]
- [ ] Skipped: Feature flag gating for this flow (e.g., `LC_TASK_GEN`) [spec:LC Messages]
- [x] Implement structured output schema for task generation (Zod/class-validator DTO) and parse model output safely [spec:this]
- [ ] Add optional tool-calling surface for domain utilities (date parsing, text normalization) and validate tool call args [spec:LC Messages]
- [ ] Return unified response envelope including `usage_metadata`, `response_metadata`, and result payload for observability [spec:LC Messages]
- [ ] Unit tests for `ai.service` including success, tool-calls, malformed output, provider errors [spec:this]
  - [x] Added unit tests for `TaskGeneratorTool` covering success and malformed output
- [ ] **Practice LC features**: Implement proper LangChain tool definitions, structured output binding, and explore streaming capabilities [spec:LC Messages]

### Phase 2 — UI adaptation (Generate AI Tasks modal)

- [ ] Update `GenerateAiTasksModal.tsx` to handle new response shape; add optimistic state + error boundaries [spec:this]
- [ ] Optionally implement streaming rendering path guarded by flag `LC_STREAMING` (fallback to buffered) [spec:LC Messages]
- [ ] Add UX affordances for retry, copy, and telemetry-aware footer (token usage if available) [spec:this]
- [ ] Component tests covering happy path, partial/streamed content, and error surfaces [spec:this]

### Phase 3 — Observability & Testability

- [ ] Emit server-side metrics: model name, latency, token usage, tool call counts (P50/P95) [spec:this]
- [ ] Add request/response sampling with PII-safe redaction and trace IDs (configurable) [spec:this]
- [ ] E2E test covering the full LangChain-backed flow behind feature flag [spec:this]

### Phase 4 — Extensions (post-MVP)

- [ ] Multi-turn conversation scaffold: persist minimal message history with `System/Human/AI` in API (opt-in per project) [spec:LC Messages]
- [ ] Expand toolset: search/internal APIs, validation tools, summarizers (guarded by provider rate/latency) [spec:LC Messages]
- [ ] Consider standardized content blocks for multimodal inputs when needed (images/files) [spec:LC Messages]

## API/Schema & Types Impact

- **Backend**
  - [x] Add DTOs under `src/ai/dto/` for `TaskGenerationRequest` and `TaskGenerationResult` with strict fields.
  - [x] Introduce `LangchainMessage` mappers for `SystemMessage`, `HumanMessage`, `AIMessage` conversions.
  - [ ] Response envelope includes `usageMetadata?: { inputTokens: number; outputTokens: number; totalTokens: number }`.
- **Frontend**
  - [x] Update `src/types/ai.ts` to mirror `TaskGenerationResult` and response envelope.
  - [ ] Ensure discriminated unions for response states: `type: 'success' | 'error' | 'stream'`.

## UX Acceptance Criteria & Test Plan

- Given feature flag `LC_TASK_GEN` is enabled, when a user invokes Generate AI Tasks, then the API uses LangChain-backed orchestration and returns structured tasks.
- When the provider returns malformed content, the UI shows a typed error state and a retry option with preserved input.
- If `LC_STREAMING` is enabled, partial content appears progressively without UI jank; disabling the flag reverts to buffered.
- **Tests**
  - [ ] Unit: API service parses structured outputs and handles tool call paths.
  - [ ] Component: `GenerateAiTasksModal` renders success/error/stream states predictably.
  - [ ] E2E: Full happy-path flow gated by feature flag.

## Risks & Mitigations

- **Provider drift or API instability (v1-alpha)**: feature flags + contract tests + pinned SDK versions.
- **Malformed outputs**: strict schemas, defensive parsing, clear error returns.
- **Latency creep with tool calls**: cap tool usage, timeouts, and fallbacks to non-tool path.
- **Token cost surprises**: surface usage metadata, sampling logs, guardrail limits.

## Rollout & Feature Flags

- `LC_TASK_GEN`: Enable LangChain-backed task generation per environment/project.
- `LC_STREAMING`: Enable streaming UI; disabled by default for initial rollout.
- Gradual enablement: start internal, then small cohort, then all.

## Definition of Done

- [ ] ADR merged with decisions and flags documented.
- [ ] Backend flow for task generation uses LangChain with structured output and tests.
- [ ] UI consumes new envelope, with streaming behind a flag and tests green.
- [ ] Metrics and sampling are emitting with redaction verified.
- [ ] E2E scenario passing and flags documented in README.

## Changelog

- 2025-01-24: Initial draft.
