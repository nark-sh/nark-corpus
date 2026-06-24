# CHANGELOG — braintree

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepened

- **Stream:** deepen-stream-3 pass 33
- **Added functions:** `addTextEvidence`, `addFileEvidence` (dispute.addTextEvidence, dispute.addFileEvidence)
- **New postconditions:** 3 total
  - `dispute-add-text-evidence-no-try-catch` — distinct InvalidKeysError on null/empty content, non-numeric sequenceNumber, or empty category; NotFoundError on closed dispute; plus standard infrastructure errors
  - `add-text-evidence-result-not-checked` — silent-failure variant: result.success=false means evidence rejected but no exception thrown
  - `dispute-add-file-evidence-no-try-catch` — NotFoundError on null/empty documentId or closed dispute; plus standard infrastructure errors
- **Rationale for promotion from prior omission:** prior deepen (2026-04-16) classified addTextEvidence/addFileEvidence as "sub-operations of dispute.finalize workflow." Re-evaluation: source confirms distinct throw paths (InvalidKeysError validation rejections, NotFoundError on stale documentUploads). Silent rejection via result.success=false is a distinct failure mode from the parent finalize. The "evidence-added-but-not-actually-added" silent loss complements the existing "evidence-added-but-not-finalized" anti-pattern.
- **Coverage:** 14 → 16 functions contracted (61 total); 47 → 45 intentionally omitted; score 0.79 → 0.82.
- **Verified by:** bc-deepen-contract (deepen-stream-3 pass 33)

## 2026-06-18 — re-verified clean

- **Latest published:** braintree@3.38.0
- **Profile semver:** `>=3.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** braintree@3.38.0
- **Profile semver:** >=3.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** braintree@3.38.0
- **Profile semver:** `>=3.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** braintree@3.38.0
- **Profile semver:** `>=3.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** braintree@3.37.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-16 — backfilled

- **Verified against:** braintree@>=3.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
