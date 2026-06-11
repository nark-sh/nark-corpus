# CHANGELOG — bcrypt

All notable verification, deepen, and fork events for this profile. Newest first.

## 2026-06-11 — semver range extended

- **Latest published:** bcrypt@6.0.0
- **Profile semver:** `>=5.0.0 <6.0.0` → `>=5.0.0 <7.0.0`
- **Verdict:** no error-handling-relevant changes in v6 — pure build toolchain change (node-pre-gyp replaced with prebuildify); zero API or error behavior changes
- **Changelog evidence:** v6.0.0: "Drop support for NodeJS <= 16", "Remove node-pre-gyp in favor of prebuildify", "Update node-addon-api to 8.3.0" — no hash/compare API or throw behavior changes
- **Verified by:** bc-version-drift (sweep 2026-06-11)

## 2026-04-16 — backfilled

- **Verified against:** bcrypt@>=5.0.0 <6.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
