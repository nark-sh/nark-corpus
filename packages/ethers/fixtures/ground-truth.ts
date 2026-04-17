/**
 * Ground-truth fixtures for ethers v6 behavioral contract.
 * Added by deepen-stream-1 pass 2 on 2026-04-16.
 * Updated by deepen-stream-2 pass 4 on 2026-04-17.
 *
 * Postconditions covered:
 *  - wait-transaction-replaced (TransactionResponse.wait)
 *  - wait-call-exception (TransactionResponse.wait)
 *  - wait-timeout (TransactionResponse.wait)
 *  - estimategas-call-exception (provider.estimateGas)
 *  - estimategas-insufficient-funds (provider.estimateGas)
 *  - call-revert-exception (provider.call)
 *  - broadcast-insufficient-funds (provider.broadcastTransaction)
 *  - from-encrypted-json-invalid-password (Wallet.fromEncryptedJson)
 *  - getlogs-range-too-large (provider.getLogs)
 *  - deploy-insufficient-funds (ContractFactory.deploy)
 *  - deploy-unsupported-operation (ContractFactory.deploy)
 *  - waitfordeployment-constructor-reverted (Contract.waitForDeployment)
 *  - queryfilter-range-too-large (Contract.queryFilter)
 *  - signtypeddata-no-provider-for-ens (wallet.signTypedData)
 */

import { ethers, isError, Wallet, ContractFactory, BaseContract } from 'ethers';

// ============================================================
// VIOLATION CASES (scanner SHOULD flag these)
// ============================================================

// @expect-violation: wait-transaction-replaced
// @expect-violation: wait-call-exception
// @expect-violation: wait-timeout
async function sendTransactionWithoutWaitErrorHandling(
  wallet: ethers.Wallet,
  to: string,
  value: bigint
) {
  const tx = await wallet.sendTransaction({ to, value });
  // Missing try-catch on tx.wait() -- TRANSACTION_REPLACED, CALL_EXCEPTION, TIMEOUT all unhandled
  const receipt = await tx.wait();
  return receipt;
}

// @expect-violation: estimategas-call-exception
// @expect-violation: estimategas-insufficient-funds
async function estimateGasWithoutErrorHandling(
  provider: ethers.JsonRpcProvider,
  tx: ethers.TransactionRequest
) {
  // Missing try-catch -- CALL_EXCEPTION and INSUFFICIENT_FUNDS unhandled
  const gasEstimate = await provider.estimateGas(tx);
  return gasEstimate;
}

// @expect-violation: call-revert-exception
async function contractCallWithoutErrorHandling(
  provider: ethers.JsonRpcProvider,
  contractAddress: string,
  data: string
) {
  // Missing try-catch -- CALL_EXCEPTION on revert unhandled
  const result = await provider.call({ to: contractAddress, data });
  return result;
}

// @expect-violation: broadcast-insufficient-funds
// @expect-violation: broadcast-nonce-expired
async function broadcastWithoutErrorHandling(
  provider: ethers.JsonRpcProvider,
  signedTx: string
) {
  // Missing try-catch -- INSUFFICIENT_FUNDS and NONCE_EXPIRED unhandled
  const txResponse = await provider.broadcastTransaction(signedTx);
  return txResponse;
}

// @expect-violation: from-encrypted-json-invalid-password
// @expect-violation: from-encrypted-json-corrupt-keystore
async function loadWalletWithoutErrorHandling(json: string, password: string) {
  // Missing try-catch -- wrong password or corrupt keystore throws unhandled
  const wallet = await Wallet.fromEncryptedJson(json, password);
  return wallet;
}

// @expect-violation: getlogs-range-too-large
async function fetchLogsWithoutErrorHandling(
  provider: ethers.JsonRpcProvider,
  address: string
) {
  // Missing try-catch -- SERVER_ERROR on large range unhandled
  const logs = await provider.getLogs({
    address,
    fromBlock: 0,
    toBlock: 'latest',
  });
  return logs;
}

// @expect-violation: deploy-insufficient-funds
// @expect-violation: deploy-unsupported-operation
async function deployContractWithoutErrorHandling(
  factory: ContractFactory
) {
  // Missing try-catch -- INSUFFICIENT_FUNDS and UNSUPPORTED_OPERATION unhandled
  const contract = await factory.deploy();
  return contract;
}

// @expect-violation: waitfordeployment-constructor-reverted
// @expect-violation: waitfordeployment-transaction-replaced
async function waitForDeploymentWithoutErrorHandling(
  contract: BaseContract
) {
  // Missing try-catch -- CALL_EXCEPTION (constructor revert) and TRANSACTION_REPLACED unhandled
  const deployed = await contract.waitForDeployment();
  return deployed;
}

// @expect-violation: queryfilter-range-too-large
// @expect-violation: queryfilter-no-provider
async function queryFilterWithoutErrorHandling(
  contract: ethers.Contract,
  eventName: string
) {
  // Missing try-catch -- SERVER_ERROR on large range unhandled
  const logs = await contract.queryFilter(eventName, 0, 'latest');
  return logs;
}

// @expect-violation: signtypeddata-no-provider-for-ens
// @expect-violation: signtypeddata-unconfigured-ens
async function signTypedDataWithoutErrorHandling(
  wallet: ethers.Wallet,
  domain: ethers.TypedDataDomain,
  types: Record<string, ethers.TypedDataField[]>,
  value: Record<string, unknown>
) {
  // Missing try-catch -- UNSUPPORTED_OPERATION (no provider for ENS) unhandled
  const signature = await wallet.signTypedData(domain, types, value);
  return signature;
}

// ============================================================
// CLEAN CASES (scanner should NOT flag these)
// ============================================================

// @expect-clean
async function sendTransactionWithFullErrorHandling(
  wallet: ethers.Wallet,
  to: string,
  value: bigint
) {
  try {
    const tx = await wallet.sendTransaction({ to, value });
    try {
      const receipt = await tx.wait();
      return receipt;
    } catch (waitError) {
      if (isError(waitError, 'TRANSACTION_REPLACED')) {
        if (waitError.cancelled) {
          console.error('Transaction was cancelled');
          return null;
        }
        return waitError.receipt;
      }
      if (isError(waitError, 'CALL_EXCEPTION')) {
        console.error('Transaction reverted on-chain:', waitError.revert);
        throw waitError;
      }
      if (isError(waitError, 'TIMEOUT')) {
        console.warn('Transaction pending -- may still be mined:', tx.hash);
        return null;
      }
      throw waitError;
    }
  } catch (sendError) {
    if (isError(sendError, 'INSUFFICIENT_FUNDS')) {
      throw new Error('Insufficient ETH balance for this transaction');
    }
    if (isError(sendError, 'ACTION_REJECTED')) {
      return null; // User cancelled -- not an error
    }
    throw sendError;
  }
}

// @expect-clean
async function estimateGasWithErrorHandling(
  provider: ethers.JsonRpcProvider,
  tx: ethers.TransactionRequest
) {
  try {
    const gasEstimate = await provider.estimateGas(tx);
    return gasEstimate;
  } catch (error) {
    if (isError(error, 'CALL_EXCEPTION')) {
      throw new Error(`Transaction would revert: ${error.shortMessage}`);
    }
    if (isError(error, 'INSUFFICIENT_FUNDS')) {
      throw new Error('Insufficient ETH to cover gas costs');
    }
    throw error;
  }
}

// @expect-clean
async function loadWalletSafely(json: string, password: string) {
  try {
    const wallet = await Wallet.fromEncryptedJson(json, password);
    return wallet;
  } catch (error) {
    if (error instanceof Error && error.message.includes('invalid password')) {
      throw new Error('Incorrect wallet password');
    }
    throw new Error('Failed to decrypt wallet -- keystore may be corrupt');
  }
}

// @expect-clean
async function deployContractSafely(factory: ContractFactory) {
  try {
    const contract = await factory.deploy();
    try {
      await contract.waitForDeployment();
      return contract;
    } catch (deployError) {
      if (isError(deployError, 'CALL_EXCEPTION')) {
        throw new Error(`Contract constructor reverted: ${deployError.shortMessage}`);
      }
      if (isError(deployError, 'TRANSACTION_REPLACED')) {
        if (!deployError.cancelled) {
          // Speed-up -- deployment may have succeeded with replacement
          return contract;
        }
        throw new Error('Deployment transaction was cancelled');
      }
      throw deployError;
    }
  } catch (error) {
    if (isError(error, 'INSUFFICIENT_FUNDS')) {
      throw new Error('Insufficient ETH to deploy contract');
    }
    if (isError(error, 'UNSUPPORTED_OPERATION')) {
      throw new Error('Signer does not support sending transactions');
    }
    throw error;
  }
}

// @expect-clean
async function queryFilterSafely(
  contract: ethers.Contract,
  eventName: string,
  fromBlock: number,
  toBlock: number
) {
  const CHUNK_SIZE = 2000;
  const allLogs: (ethers.EventLog | ethers.Log)[] = [];

  for (let start = fromBlock; start <= toBlock; start += CHUNK_SIZE) {
    const end = Math.min(start + CHUNK_SIZE - 1, toBlock);
    try {
      const chunk = await contract.queryFilter(eventName, start, end);
      allLogs.push(...chunk);
    } catch (error) {
      if (isError(error, 'SERVER_ERROR')) {
        throw new Error(`Event log query failed for blocks ${start}-${end}: ${error.shortMessage}`);
      }
      throw error;
    }
  }
  return allLogs;
}

// @expect-clean
async function signTypedDataSafely(
  wallet: ethers.Wallet,
  domain: ethers.TypedDataDomain,
  types: Record<string, ethers.TypedDataField[]>,
  value: Record<string, unknown>
) {
  try {
    const signature = await wallet.signTypedData(domain, types, value);
    return signature;
  } catch (error) {
    if (isError(error, 'UNSUPPORTED_OPERATION')) {
      throw new Error('Wallet requires a provider to resolve ENS names in typed data');
    }
    if (isError(error, 'UNCONFIGURED_NAME')) {
      throw new Error(`ENS name not configured: ${(error as ethers.EthersError & { value?: string }).value}`);
    }
    throw error;
  }
}

// @expect-clean
async function fetchLogsPaginated(
  provider: ethers.JsonRpcProvider,
  address: string,
  fromBlock: number,
  toBlock: number
) {
  const CHUNK_SIZE = 2000;
  const allLogs: ethers.Log[] = [];

  for (let start = fromBlock; start <= toBlock; start += CHUNK_SIZE) {
    const end = Math.min(start + CHUNK_SIZE - 1, toBlock);
    try {
      const chunk = await provider.getLogs({ address, fromBlock: start, toBlock: end });
      allLogs.push(...chunk);
    } catch (error) {
      if (isError(error, 'SERVER_ERROR')) {
        console.error(`Log query failed for blocks ${start}-${end}:`, error.shortMessage);
        throw error;
      }
      throw error;
    }
  }
  return allLogs;
}
