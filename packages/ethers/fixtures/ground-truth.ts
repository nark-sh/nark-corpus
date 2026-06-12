/**
 * Ground-truth fixtures for ethers v6 behavioral contract.
 * Added by deepen-stream-1 pass 2 on 2026-04-16.
 * Updated by deepen-stream-2 pass 4 on 2026-04-17.
 * Updated by deepen-stream-2 pass 7 on 2026-04-16.
 * Updated by deepen-stream-2 pass 8 on 2026-04-17.
 * Updated by deepen-stream-1 pass 4 on 2026-06-12 (+wallet.signTransaction, +wallet.authorize).
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
 *  - browserprovider-getsigner-action-rejected (BrowserProvider.getSigner)
 *  - browserprovider-getsigner-no-wallet (BrowserProvider.getSigner)
 *  - encrypt-invalid-scrypt-options (Wallet.encrypt)
 *  - encrypt-oom-crash (Wallet.encrypt)
 *  - jsonrpc-getsigner-no-such-account (JsonRpcProvider.getSigner)
 *  - contract-method-call-exception (Contract.method)
 *  - contract-method-no-signer (Contract.method)
 *  - provider-send-unsupported-method (provider.send)
 *  - provider-send-network-error (provider.send)
 *  - signtransaction-from-address-mismatch (wallet.signTransaction)
 *  - signtransaction-invalid-transaction-fields (wallet.signTransaction)
 *  - authorize-no-provider-for-auto-fill (wallet.authorize)
 *  - authorize-invalid-delegate-address (wallet.authorize)
 */

import { ethers, isError, Wallet, ContractFactory, BaseContract, BrowserProvider, JsonRpcProvider } from 'ethers';

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

// ============================================================
// PASS 7 additions: BrowserProvider.getSigner, Wallet.encrypt,
//   JsonRpcProvider.getSigner (added 2026-04-16)
// ============================================================

// @expect-violation: browserprovider-getsigner-action-rejected
// @expect-violation: browserprovider-getsigner-no-wallet
async function connectWalletWithoutErrorHandling(
  provider: BrowserProvider
) {
  // Missing try-catch -- ACTION_REJECTED when user denies MetaMask popup unhandled
  const signer = await provider.getSigner();
  return signer;
}

// @expect-violation: encrypt-invalid-scrypt-options
// @expect-violation: encrypt-oom-crash
async function encryptWalletWithoutErrorHandling(
  wallet: Wallet,
  password: string
) {
  // Missing try-catch -- INVALID_ARGUMENT or OOM crash on bad options unhandled
  const json = await wallet.encrypt(password);
  return json;
}

// @expect-violation: jsonrpc-getsigner-no-such-account
async function getJsonRpcSignerWithoutErrorHandling(
  provider: JsonRpcProvider,
  accountIndex: number
) {
  // Missing try-catch -- throws "no such account" if index >= accounts.length
  const signer = await provider.getSigner(accountIndex);
  return signer;
}

// @expect-clean
async function connectWalletWithErrorHandling(
  provider: BrowserProvider
) {
  try {
    const signer = await provider.getSigner();
    return signer;
  } catch (error) {
    if (isError(error, 'ACTION_REJECTED')) {
      // User dismissed the wallet connection popup -- not a bug
      console.info('Wallet connection rejected by user');
      return null;
    }
    if (isError(error, 'UNSUPPORTED_OPERATION')) {
      throw new Error('Wallet does not support account access -- please update your wallet');
    }
    throw error;
  }
}

// @expect-clean
async function encryptWalletSafely(
  wallet: Wallet,
  password: string
) {
  try {
    const json = await wallet.encrypt(password);
    return json;
  } catch (error) {
    if (error instanceof RangeError) {
      throw new Error('Insufficient memory for wallet encryption -- increase Lambda memory to 512MB+');
    }
    if (error instanceof Error && error.message.includes('invalid scrypt')) {
      throw new Error('Invalid encryption options -- use default scrypt parameters');
    }
    throw error;
  }
}

// @expect-clean
async function getJsonRpcSignerSafely(
  provider: JsonRpcProvider,
  accountIndex: number
) {
  try {
    const signer = await provider.getSigner(accountIndex);
    return signer;
  } catch (error) {
    // Note: throws plain Error (not EthersError), so isError() won't work here
    if (error instanceof Error && (
      error.message === 'no such account' ||
      error.message === 'invalid account'
    )) {
      throw new Error(`Account index ${accountIndex} not available on this node`);
    }
    throw error;
  }
}

// ============================================================
// PASS 8 additions: Contract.method, provider.send
//   (added 2026-04-17)
// ============================================================

// Helper interface for typed contract method calls
interface ERC20Contract extends ethers.BaseContract {
  transfer(to: string, amount: bigint): Promise<ethers.ContractTransactionResponse>;
  balanceOf(owner: string): Promise<bigint>;
}

// @expect-violation: contract-method-call-exception
// @expect-violation: contract-method-no-signer
async function callContractMethodWithoutErrorHandling(
  contract: ERC20Contract,
  recipient: string,
  amount: bigint
) {
  // Missing try-catch -- CALL_EXCEPTION on revert, UNSUPPORTED_OPERATION if no signer
  const tx = await contract.transfer(recipient, amount);
  const receipt = await tx.wait();
  return receipt;
}

// @expect-violation: provider-send-unsupported-method
// @expect-violation: provider-send-network-error
async function sendRawRpcWithoutErrorHandling(
  provider: JsonRpcProvider,
  txHash: string
) {
  // Missing try-catch -- UNSUPPORTED_OPERATION if node doesn't support trace_transaction,
  // SERVER_ERROR or NETWORK_ERROR on connectivity failure
  const trace = await provider.send('trace_transaction', [txHash]);
  return trace;
}

// @expect-clean
async function callContractMethodWithErrorHandling(
  contract: ERC20Contract,
  recipient: string,
  amount: bigint
) {
  try {
    const tx = await contract.transfer(recipient, amount);
    try {
      const receipt = await tx.wait();
      return receipt;
    } catch (waitError) {
      if (isError(waitError, 'CALL_EXCEPTION')) {
        throw new Error(`Transfer reverted: ${waitError.shortMessage}`);
      }
      if (isError(waitError, 'TRANSACTION_REPLACED')) {
        if (waitError.cancelled) {
          throw new Error('Transfer transaction was cancelled (replaced with lower-gas tx)');
        }
        return waitError.receipt;
      }
      throw waitError;
    }
  } catch (sendError) {
    if (isError(sendError, 'UNSUPPORTED_OPERATION')) {
      throw new Error('Contract must be connected to a Signer to send transactions');
    }
    if (isError(sendError, 'INSUFFICIENT_FUNDS')) {
      throw new Error('Insufficient ETH to cover gas for this transfer');
    }
    if (isError(sendError, 'NONCE_EXPIRED')) {
      throw new Error('Transaction nonce already used -- retry with fresh nonce');
    }
    throw sendError;
  }
}

// @expect-clean
async function sendRawRpcWithErrorHandling(
  provider: JsonRpcProvider,
  txHash: string
) {
  try {
    const trace = await provider.send('trace_transaction', [txHash]);
    return trace;
  } catch (error) {
    if (isError(error, 'UNSUPPORTED_OPERATION')) {
      throw new Error('This RPC provider does not support trace_transaction -- use Alchemy with trace API enabled');
    }
    if (isError(error, 'SERVER_ERROR') || isError(error, 'NETWORK_ERROR')) {
      throw new Error(`RPC request failed: ${error instanceof Error ? error.message : 'network error'}`);
    }
    throw error;
  }
}

// ============================================================
// Added by deepen-stream-1 pass 4 (2026-06-12):
//   wallet.signTransaction (offline signing -- INVALID_ARGUMENT paths)
//   wallet.authorize (EIP-7702 / Pectra -- ethers v6.16.0+)
// ============================================================

// @expect-violation: signtransaction-from-address-mismatch
// @expect-violation: signtransaction-invalid-transaction-fields
async function signRelayedTransactionWithoutErrorHandling(
  wallet: Wallet,
  to: string,
  value: bigint
) {
  // Missing try-catch on signTransaction() -- INVALID_ARGUMENT (tx.from mismatch)
  // and INVALID_ARGUMENT (bad type-2 fee fields) both crash this relayer flow
  const signedTx = await wallet.signTransaction({
    to,
    value,
    from: '0x0000000000000000000000000000000000000001', // wrong from -> assertArgument fires
    maxFeePerGas: undefined as unknown as bigint, // bad type-2 field -> Transaction.from throws
  });
  return signedTx;
}

// @expect-clean
async function signRelayedTransactionWithErrorHandling(
  wallet: Wallet,
  to: string,
  value: bigint
) {
  try {
    // Note: omit `from` so ethers fills it in correctly. Populate fee fields explicitly.
    const signedTx = await wallet.signTransaction({
      to,
      value,
      type: 2,
      maxFeePerGas: 30_000_000_000n,
      maxPriorityFeePerGas: 1_000_000_000n,
      gasLimit: 21_000n,
    });
    return signedTx;
  } catch (error) {
    if (isError(error, 'INVALID_ARGUMENT')) {
      throw new Error(
        `Cannot sign transaction (${error.argument ?? 'unknown field'}): ${error.shortMessage ?? 'invalid request'}`
      );
    }
    throw error;
  }
}

// @expect-violation: authorize-no-provider-for-auto-fill
// @expect-violation: authorize-invalid-delegate-address
async function authorizeDelegationWithoutErrorHandling(
  wallet: Wallet,
  delegateContract: string | null
) {
  // Missing try-catch on authorize() -- UNSUPPORTED_OPERATION fires when wallet
  // has no provider attached and chainId/nonce are not supplied; INVALID_ARGUMENT
  // fires when the delegate address is not a string (null from API response).
  const authorization = await wallet.authorize({
    address: delegateContract as string, // may be null from API -> INVALID_ARGUMENT
    // chainId and nonce omitted -> provider lookup required
  });
  return authorization;
}

// @expect-clean
async function authorizeDelegationWithErrorHandling(
  wallet: Wallet,
  delegateContract: string,
  chainId: bigint,
  nonce: number
) {
  try {
    // Supply chainId + nonce explicitly so authorize() never touches the provider.
    // Validate delegate address before calling.
    if (!ethers.isAddress(delegateContract)) {
      throw new Error(`Invalid delegate contract address: ${delegateContract}`);
    }
    const authorization = await wallet.authorize({
      address: delegateContract,
      chainId,
      nonce,
    });
    return authorization;
  } catch (error) {
    if (isError(error, 'INVALID_ARGUMENT')) {
      throw new Error(
        `EIP-7702 authorization rejected: ${error.shortMessage ?? 'invalid field'}`
      );
    }
    if (isError(error, 'UNSUPPORTED_OPERATION')) {
      throw new Error(
        'Wallet has no provider attached and chainId/nonce were not supplied -- attach a provider or pass both fields explicitly'
      );
    }
    throw error;
  }
}
