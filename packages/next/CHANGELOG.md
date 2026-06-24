# CHANGELOG — next

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 100% → 100% (+6 functions, +9 postconditions)

- **Profile:** `packages/next/contract.yaml`
- **Functions added:** forbidden, unauthorized, connection, draftMode, after, updateTag (6 total)
- **Postconditions added:** 9
  - forbidden-inside-try-catch
  - unauthorized-inside-try-catch
  - connection-missing-await
  - connection-inside-after
  - draft-mode-missing-await
  - after-error-swallowed
  - after-called-outside-request-scope
  - update-tag-after-redirect
  - update-tag-outside-server-action
- **Functions intentionally omitted this pass:** useRouter / usePathname / useSearchParams / useParams / useSelectedLayoutSegments / useSelectedLayoutSegment (client-side hooks, no error contracts); unstable_noStore (superseded by connection() in Next.js 15+)
- **Scanner concerns queued:** 9 (`concern-20260624-next-deepen-1` through `concern-20260624-next-deepen-9`)
- **Scanner version used:** nark@1.0.3
- **Sources fetched:**
  - https://nextjs.org/docs/app/api-reference/functions/forbidden
  - https://nextjs.org/docs/app/api-reference/functions/unauthorized
  - https://nextjs.org/docs/app/api-reference/functions/connection
  - https://nextjs.org/docs/app/api-reference/functions/draft-mode
  - https://nextjs.org/docs/app/api-reference/functions/after
  - https://nextjs.org/docs/app/api-reference/functions/updateTag
  - node_modules/next@16.2.9 source (forbidden.js, unauthorized.js, connection.js, draft-mode.d.ts, after.js, revalidate.d.ts)
- **Pattern:** class-hierarchy gaps. forbidden/unauthorized are siblings of notFound in the HTTPAccessFallback error family (digests "NEXT_HTTP_ERROR_FALLBACK;403" and ";401"). connection/draftMode are async siblings of cookies/headers introduced in Next.js 15. updateTag is the read-your-own-writes sibling of revalidateTag added in Next.js 16. Original 2026-04-17 pass covered one base of each family but missed the siblings introduced in v15/v16.
- **Verified by:** bc-deepen-contract (deepen-stream-3 pass 56 on 2026-06-24)

## 2026-06-18 — re-verified clean

- **Latest published:** next@16.2.9
- **Profile semver:** `>=13.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** next@16.2.9
- **Profile semver:** >=13.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** next@16.2.9
- **Profile semver:** `>=13.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


## 2026-06-15 — re-verified clean

- **Latest published:** next@16.2.9
- **Profile semver:** `>=13.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** next@16.2.9
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-04-17 — backfilled

- **Verified against:** next@>=13.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
