# CHANGELOG — ethers

All notable verification, deepen, and fork events for this profile. Newest first.



## 2026-06-15 — re-verified clean

- **Latest published:** ethers@6.16.0
- **Profile semver:** `>=6.0.0 <7.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (or only patch/minor drift, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-15)

## 2026-06-14 — re-verified clean

- **Latest published:** ethers@6.16.0
- **Profile semver:**  (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver (patch/minor drift only, no error-handling changes)
- **Scanner version used:** nark@1.0.3
- **Verified by:** bc-version-drift (sweep 2026-06-14)

## 2026-06-12 — deepen pass — coverage 75% → 77%

- **Profile:** `packages/ethers/contract.yaml`
- **Functions added:** wallet.signTransaction, wallet.authorize (2 total)
- **Postconditions added:** 4 (signtransaction-from-address-mismatch, signtransaction-invalid-transaction-fields, authorize-no-provider-for-auto-fill, authorize-invalid-delegate-address)
- **Functions intentionally omitted this pass:** JsonRpcProvider.listAccounts (delegates to provider.send error contract), HDNodeWallet.fromPhrase/fromSeed/fromMnemonic (sync factories)
- **Scanner concerns queued:** 2 (`concern-20260612-ethers-deepen-1` signTransaction detection, `concern-20260612-ethers-deepen-2` authorize detection)
- **Scanner version used:** nark@3.0.0
- **Sources fetched:**
  - https://docs.ethers.org/v6/api/wallet/#BaseWallet-signTransaction
  - https://docs.ethers.org/v6/api/wallet/#BaseWallet-authorize
  - https://eips.ethereum.org/EIPS/eip-7702
  - lib.esm/wallet/base-wallet.js (ethers@6.16.0 installed source)
  - lib.esm/providers/abstract-signer.js (ethers@6.16.0 installed source)
- **Verified by:** bc-deepen-contract (pass 4 on 2026-06-12T03:05Z, deepen-stream-1)

## 2026-04-17 — backfilled

- **Verified against:** ethers@>=6.0.0 <7.0.0
- **Verdict:** initial state (backfilled by bc-version-drift on 2026-06-11; pre-CHANGELOG.md history not preserved)
- **Source:** `contract.yaml` (`last_verified` field as of backfill)
