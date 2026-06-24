# CHANGELOG — @google/generative-ai

All notable verification, deepen, and fork events for this profile. Newest first.

## 2026-06-24 — deepen pass — coverage 83% → 93%

- **Profile:** `packages/@google/generative-ai/contract.yaml`
- **Functions added:** GoogleAIFileManager.getFile, GoogleAIFileManager.deleteFile, GoogleAICacheManager.delete (3 total)
- **Postconditions added:** 3 (getfile-network-error, deletefile-network-error, cache-delete-network-error)
- **Functions intentionally omitted this pass:** ChatSession.getHistory (sync getter), GoogleAIFileManager.listFiles (read-only enumeration), GoogleAICacheManager.list / .get (read-only enumeration / fetch), GenerativeModel.startChat (sync factory)
- **Scanner concerns queued:** 3 (`concern-20260624-google-generative-ai-deepen-1`, `concern-20260624-google-generative-ai-deepen-2`, `concern-20260624-google-generative-ai-deepen-3`)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:** https://ai.google.dev/gemini-api/docs/file-prompting-strategies, https://ai.google.dev/gemini-api/docs/caching, https://ai.google.dev/gemini-api/docs/troubleshooting
- **Verified by:** bc-deepen-contract (deepen-stream-2 pass 41 — drift-by-staleness re-pass)

Rationale: re-enumeration against @google/generative-ai@0.24.1 (unchanged since 2026-04-16) found no new API surface, but 3 functions previously omitted as "cleanup / read-only" make real HTTP calls with documented 404 surfaces that crash callers in common patterns (polling loop after uploadFile, finally-block cleanup, double-delete in retry logic). Reclassifying these as contracted reflects actual operational risk rather than treating them as inert.

## 2026-06-18 — re-verified clean

- **Latest published:** @google/generative-ai@0.24.1
- **Profile semver:** `>=0.11.0 <1.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** @google/generative-ai@0.24.1
- **Profile semver:** >=0.11.0 <1.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** @google/generative-ai@0.24.1
- **Profile semver:** `>=0.11.0 <1.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** @google/generative-ai@0.24.1
- **Profile semver:** `>=0.11.0 <1.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** @google/generative-ai@0.24.1
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-16 — backfilled

- **Verified against:** @google/generative-ai@>=0.11.0 <1.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
