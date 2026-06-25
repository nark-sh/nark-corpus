# CHANGELOG — openai

## 2026-06-25 — re-verified clean

- **Latest published:** openai@6.45.0
- **Profile semver:** >=4.0.0 <7.0.0 (unchanged)
- **Verdict:** no changes — latest satisfies declared semver (or drift is benign; new major covered by existing fork profile where applicable)
- **Scanner version used:** nark@3.2.0
- **Verified by:** bc-version-drift (sweep 2026-06-25)


All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 80% → 82%

- **Profile:** `packages/openai/contract.yaml`
- **Functions added:** images.edit (covers both non-streaming Promise<ImagesResponse> and streaming Stream<ImageEditStreamEvent> variants)
- **Postconditions added:** 4 (`images-edit-authentication-error`, `images-edit-content-policy-violation`, `images-edit-stream-mid-stream-api-error`, `images-edit-stream-abort-silent-termination`)
- **Functions intentionally omitted this pass:** none promoted-out except images.edit. Remaining omitted list (19) unchanged — see deepen-index.json `functions_intentionally_omitted`.
- **Scanner concerns queued:** 2 (`concern-20260624-openai-deepen-images-edit-1`, `concern-20260624-openai-deepen-images-edit-2`)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:**
  - `node_modules/openai@6.44.0/resources/images.d.ts` (edit overloads — streaming + non-streaming)
  - `node_modules/openai@6.44.0/resources/images.js` (POST /images/edits with stream flag pulled from body)
  - `node_modules/openai@6.44.0/core/streaming.js` (lines 49-50, 65-66, 73-78 — SSE error -> APIError throw, isAbortError silent return)
  - `node_modules/openai@6.44.0/CHANGELOG.md` (6.34 -> 6.44 minor-version drift summary)
  - https://platform.openai.com/docs/api-reference/images/createEdit
  - https://platform.openai.com/docs/guides/images/usage-policies
- **Rationale for revisit:** Pass 10 (2026-04-16) omitted `images.edit()` as "same error surface as generate, rarely used." That was correct for the non-streaming path. Drift-by-staleness pass 39 (70 days later, openai-node 6.34 -> 6.44) revealed the streaming variant `edit({stream: true}) -> Stream<ImageEditStreamEvent>` has the same SSE error contract as `chat.completions.stream` — mid-stream APIError throws + silent-abort termination. SaaS chat UIs that integrate inline image editing for GPT Image models (gpt-image-1.5 / gpt-image-1-mini / chatgpt-image-latest) use partial_image streaming for preview UX, so this is a real runtime path. Promoted images.edit() out of intentionally-omitted; coverage 80% -> 82% (35 -> 36 contracted / 44 total).
- **Verified by:** bc-deepen-contract (pass 39 on 2026-06-24, deepen-stream-2)

## 2026-06-18 — re-verified clean

- **Latest published:** openai@6.44.0
- **Profile semver:** `>=4.0.0 <7.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** openai@6.44.0
- **Profile semver:** >=4.0.0 <7.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** openai@6.42.0
- **Profile semver:** `>=4.0.0 <7.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** openai@6.42.0
- **Profile semver:** `>=4.0.0 <7.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** openai@6.42.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-16 — backfilled

- **Verified against:** openai@>=4.0.0 <7.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
