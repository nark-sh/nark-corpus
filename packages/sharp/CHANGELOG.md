# CHANGELOG — sharp

## 2026-06-25 — re-verified clean

- **Latest published:** sharp@0.35.2
- **Profile semver:** >=0.30.0 <1.0.0 (unchanged)
- **Verdict:** no changes — latest satisfies declared semver (or drift is benign; new major covered by existing fork profile where applicable)
- **Scanner version used:** nark@3.2.0
- **Verified by:** bc-version-drift (sweep 2026-06-25)


All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 100% → 100% (API surface grew 4 → 5)

- **Profile:** `packages/sharp/contract.yaml`
- **Functions added:** toUint8Array (1 total)
- **Postconditions added:** 1 (touint8array-rejects-on-error)
- **Functions intentionally omitted this pass:** none
- **Scanner concerns queued:** 0 — scanner already detects via `factory_methods: [sharp]` + chain detector + exact-name match in findFunctionContract(). Ground-truth fixture confirms 4 new tests pass (2 SHOULD_FIRE, 2 SHOULD_NOT_FIRE).
- **Scanner version used:** nark@3.2.0
- **Sources fetched:**
  - https://sharp.pixelplumbing.com/api-output#touint8array (API doc — confirms v0.35.0 introduction + Promise return shape)
  - dist/output.mjs in sharp@0.35.2 (source — confirms _pipeline() shared rejection path with toBuffer/toFile via is.nativeError(err, stack))
- **API surface delta:** sharp@0.35.0 added `toUint8Array(): Promise<{data: Uint8Array, info: OutputInfo}>` as a zero-copy alternative to toBuffer() — the underlying ArrayBuffer is transferable, which makes it the canonical encode path for worker postMessage flows. Profile semver `>=0.30.0 <1.0.0` already covers this version.
- **Verified by:** bc-deepen-contract (pass on 2026-06-24, deepen-stream-2 pass=37)

## 2026-06-18 — re-verified clean

- **Latest published:** sharp@0.35.1
- **Profile semver:** `>=0.30.0 <1.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** sharp@0.35.1
- **Profile semver:** >=0.30.0 <1.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** sharp@0.35.1
- **Profile semver:** `>=0.30.0 <1.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** sharp@0.35.1
- **Profile semver:** `>=0.30.0 <1.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** sharp@0.35.1
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-15 — backfilled

- **Verified against:** sharp@>=0.30.0 <1.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
