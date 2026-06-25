# CHANGELOG — @octokit/rest

## 2026-06-25 — re-verified clean

- **Latest published:** @octokit/rest@22.0.1
- **Profile semver:** >=19.0.0 <23.0.0 (unchanged)
- **Verdict:** no changes — latest satisfies declared semver (or drift is benign; new major covered by existing fork profile where applicable)
- **Scanner version used:** nark@3.2.0
- **Verified by:** bc-version-drift (sweep 2026-06-25)


All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 80% → 82%

- **Profile:** `packages/@octokit/rest/contract.yaml`
- **Functions added:** apps.createInstallationAccessToken, repos.compareCommitsWithBasehead, issues.removeLabel, pulls.dismissReview (4 total)
- **Postconditions added:** 4 (one per function, each covering 3-4 status codes)
- **Functions intentionally omitted this pass:** none new (carried forward from pass 4)
- **Scanner concerns queued:** 4 (`concern-20260624-octokit-rest-deepen-17` through `concern-20260624-octokit-rest-deepen-20`)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:**
  - https://docs.github.com/en/rest/apps/apps#create-an-installation-access-token-for-an-app
  - https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-an-installation-access-token-for-a-github-app
  - https://docs.github.com/en/rest/commits/commits#compare-two-commits
  - https://docs.github.com/en/rest/issues/labels#remove-a-label-from-an-issue
  - https://docs.github.com/en/rest/pulls/reviews#dismiss-a-review-for-a-pull-request
- **Verified by:** bc-deepen-contract / deepen-stream-2 (pass 47 on 2026-06-24T05:02:39Z)


## 2026-06-18 — re-verified clean

- **Latest published:** @octokit/rest@22.0.1
- **Profile semver:** `>=19.0.0 <23.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** @octokit/rest@22.0.1
- **Profile semver:** >=19.0.0 <23.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** @octokit/rest@22.0.1
- **Profile semver:** `>=19.0.0 <23.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** @octokit/rest@22.0.1
- **Profile semver:** `>=19.0.0 <23.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** @octokit/rest@22.0.1
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-13 — backfilled

- **Verified against:** @octokit/rest@>=19.0.0 <23.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
