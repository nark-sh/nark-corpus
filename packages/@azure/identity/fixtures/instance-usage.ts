/**
 * @azure/identity — Instance Usage Fixture
 *
 * Tests detection of getToken() calls via various credential instances.
 * Covers different credential types and instance creation patterns.
 */

import {
  DefaultAzureCredential,
  ClientSecretCredential,
  ManagedIdentityCredential,
  WorkloadIdentityCredential,
  ChainedTokenCredential,
  CredentialUnavailableError,
  AuthenticationError,
} from '@azure/identity';

// ─────────────────────────────────────────────────────────────────────────────
// 1. Instance created in function scope
// ─────────────────────────────────────────────────────────────────────────────

/**
 * ❌ Violation: instance created locally, getToken() not wrapped
 */
async function localInstanceNoCatch(): Promise<string | null> {
  const credential = new DefaultAzureCredential();
  const token = await credential.getToken('https://storage.azure.com/.default');
  return token?.token ?? null;
}

/**
 * ✅ Proper: instance created locally, getToken() wrapped in try-catch
 */
async function localInstanceWithCatch(): Promise<string | null> {
  const credential = new DefaultAzureCredential();
  try {
    const token = await credential.getToken('https://storage.azure.com/.default');
    return token?.token ?? null;
  } catch (err) {
    console.error('Failed to get token:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. ClientSecretCredential via constructor injection
// ─────────────────────────────────────────────────────────────────────────────

class TokenService {
  constructor(
    private readonly credential: ClientSecretCredential,
    private readonly scope: string
  ) {}

  /**
   * ❌ Violation: method doesn't wrap getToken() in try-catch
   */
  async getAccessToken(): Promise<string | null> {
    const token = await this.credential.getToken(this.scope);
    return token?.token ?? null;
  }

  /**
   * ✅ Proper: method wraps getToken() in try-catch
   */
  async getAccessTokenSafe(): Promise<string | null> {
    try {
      const token = await this.credential.getToken(this.scope);
      return token?.token ?? null;
    } catch (err) {
      if (err instanceof AuthenticationError) {
        console.error('Auth failed in TokenService:', err.message);
      }
      throw err;
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. ManagedIdentityCredential in module-level variable
// ─────────────────────────────────────────────────────────────────────────────

const managedCredential = new ManagedIdentityCredential();

/**
 * ❌ Violation: module-level instance, method-level missing try-catch
 */
async function fetchWithManagedIdentityNoCatch(): Promise<string | null> {
  const token = await managedCredential.getToken('https://storage.azure.com/.default');
  return token?.token ?? null;
}

/**
 * ✅ Proper: module-level instance with proper error handling
 */
async function fetchWithManagedIdentityWithCatch(): Promise<string | null> {
  try {
    const token = await managedCredential.getToken('https://storage.azure.com/.default');
    return token?.token ?? null;
  } catch (err) {
    if (err instanceof CredentialUnavailableError) {
      console.error('Managed identity not available:', err.message);
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. WorkloadIdentityCredential
// ─────────────────────────────────────────────────────────────────────────────

const workloadCredential = new WorkloadIdentityCredential({
  tenantId: process.env.AZURE_TENANT_ID!,
  clientId: process.env.AZURE_CLIENT_ID!,
  tokenFilePath: process.env.AZURE_FEDERATED_TOKEN_FILE!,
});

/**
 * ❌ Violation: WorkloadIdentityCredential without try-catch
 */
async function getWorkloadTokenNoCatch(): Promise<string | null> {
  const token = await workloadCredential.getToken('https://storage.azure.com/.default');
  return token?.token ?? null;
}

/**
 * ✅ Proper: WorkloadIdentityCredential with try-catch
 */
async function getWorkloadTokenWithCatch(): Promise<string | null> {
  try {
    const token = await workloadCredential.getToken('https://storage.azure.com/.default');
    return token?.token ?? null;
  } catch (err) {
    console.error('Workload identity token error:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. ChainedTokenCredential
// ─────────────────────────────────────────────────────────────────────────────

const chainedCredential = new ChainedTokenCredential(
  new ManagedIdentityCredential(),
  new ClientSecretCredential(
    process.env.AZURE_TENANT_ID!,
    process.env.AZURE_CLIENT_ID!,
    process.env.AZURE_CLIENT_SECRET!
  )
);

/**
 * ❌ Violation: ChainedTokenCredential.getToken() without try-catch
 */
async function getChainedTokenNoCatch(): Promise<string | null> {
  const token = await chainedCredential.getToken('https://storage.azure.com/.default');
  return token?.token ?? null;
}

/**
 * ✅ Proper: ChainedTokenCredential with try-catch
 */
async function getChainedTokenWithCatch(): Promise<string | null> {
  try {
    const token = await chainedCredential.getToken('https://storage.azure.com/.default');
    return token?.token ?? null;
  } catch (err) {
    console.error('Chained credential token error:', err);
    throw err;
  }
}
