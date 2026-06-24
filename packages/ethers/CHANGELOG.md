# CHANGELOG — ethers

All notable verification, deepen, and fork events for this profile. Newest first.


## 2026-06-24 — deepen pass — coverage 81% → 85%

- **Profile:** `packages/ethers/contract.yaml`
- **Functions added:** Signer.populateAuthorization (1 total)
- **Postconditions added:** 2 (populateauthorization-no-provider-for-auto-fill, populateauthorization-network-rpc-failure)
- **Functions intentionally omitted this pass:** none new — previously-omitted list unchanged
- **Scanner concerns queued:** 2 (`concern-20260624-ethers-deepen-1`, `concern-20260624-ethers-deepen-2`)
- **Scanner version used:** nark@3.2.0
- **Sources fetched:**
  - `lib.esm/providers/abstract-signer.js:172-183` populateAuthorization() — checkProvider + getNonce calls (source-level evidence for both postconditions)
  - `lib.esm/providers/abstract-signer.js` checkProvider() throws UNSUPPORTED_OPERATION on null provider
  - https://docs.ethers.org/v6/api/providers/#AbstractSigner-populateAuthorization
  - https://docs.ethers.org/v6/api/providers/#FallbackProvider
  - https://docs.ethers.org/v6/api/utils/errors/#UnsupportedOperationError
  - https://docs.ethers.org/v6/api/utils/errors/
  - https://eips.ethereum.org/EIPS/eip-7702
- **Verified by:** bc-deepen-contract (pass on 2026-06-24T13:50:10Z, deepen-stream-2 pass 94)

## 2026-06-18 — deepen pass — coverage 77% → 81%

- **Profile:** `packages/ethers/contract.yaml`
- **Functions added:** Signer.populateTransaction (1 total)
- **Postconditions added:** 4 (populatetransaction-no-provider, -chainid-mismatch, -mixed-fee-fields, -network-fee-model-unsupported)
- **Functions intentionally omitted this pass:** none new — previously-omitted list unchanged (read-only GETs, ENS utilities, sync-wrapped-as-async crypto)
- **Scanner concerns queued:** 2 (`concern-20260618-ethers-deepen-1`, `concern-20260618-ethers-deepen-2`)
- **Scanner version used:** nark@3.1.0
- **Sources fetched:**
  - `lib.esm/providers/abstract-signer.js` populateTransaction() — assertArgument / assert calls (source-level evidence for all 4 postconditions)
  - https://docs.ethers.org/v6/api/providers/#AbstractSigner-populateTransaction
  - https://docs.ethers.org/v6/api/providers/#Signer
  - https://docs.ethers.org/v6/api/providers/#Provider-getFeeData
  - https://docs.ethers.org/v6/api/utils/errors/#UnsupportedOperationError
  - https://eips.ethereum.org/EIPS/eip-1559
- **Verified by:** bc-deepen-contract (pass on 2026-06-18T19:00:00Z, deepen-stream-2 pass 4)

## 2026-06-18 — re-verified clean

- **Latest published:** ethers@6.17.0
- **Profile semver:** `>=6.0.0 <7.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.1.0
- **Verified by:** bc-version-drift (sweep 2026-06-18)

## 2026-06-17 — re-verified clean

- **Latest published:** ethers@6.16.0
- **Profile semver:** >=6.0.0 <7.0.0 (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-17)

## 2026-06-16 — re-verified clean

- **Latest published:** ethers@6.16.0
- **Profile semver:** `>=6.0.0 <7.0.0` (unchanged)
- **Verdict:** no changes — latest already satisfies declared semver
- **Scanner version used:** nark@3.0.2
- **Verified by:** bc-version-drift (sweep 2026-06-16)


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
