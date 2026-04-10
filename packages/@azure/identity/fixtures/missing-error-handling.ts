/**
 * @azure/identity — Missing Error Handling Fixture
 *
 * All functions in this file are MISSING try-catch around getToken().
 * The V2 analyzer should detect ERROR violations for each unprotected call.
 *
 * These are anti-patterns — they demonstrate the violation the contract catches.
 */

import {
  DefaultAzureCredential,
  ClientSecretCredential,
  ManagedIdentityCredential,
  WorkloadIdentityCredential,
} from '@azure/identity';

// ─────────────────────────────────────────────────────────────────────────────
// 1. DefaultAzureCredential — missing error handling
// ─────────────────────────────────────────────────────────────────────────────

const defaultCredential = new DefaultAzureCredential();

/**
 * ❌ Missing: no try-catch around getToken()
 * getToken() throws CredentialUnavailableError when no credential source is configured.
 */
async function getStorageTokenNoCatch(): Promise<string | null> {
  const token = await defaultCredential.getToken('https://storage.azure.com/.default');
  return token?.token ?? null;
}

/**
 * ❌ Missing: fire-and-forget getToken() — result not even used
 */
async function prefetchTokenNoCatch(): Promise<void> {
  await defaultCredential.getToken('https://management.azure.com/.default');
}

/**
 * ❌ Missing: getToken() result assigned and used, still no try-catch
 */
async function getKeyVaultSecretNoCatch(): Promise<string | null> {
  const tokenResponse = await defaultCredential.getToken('https://vault.azure.net/.default');
  return tokenResponse?.token ?? null;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. ClientSecretCredential — missing error handling
// ─────────────────────────────────────────────────────────────────────────────

const clientSecretCredential = new ClientSecretCredential(
  process.env.AZURE_TENANT_ID!,
  process.env.AZURE_CLIENT_ID!,
  process.env.AZURE_CLIENT_SECRET!
);

/**
 * ❌ Missing: ClientSecretCredential.getToken() without try-catch
 * Throws AuthenticationError when client secret is wrong or tenant is invalid.
 */
async function getGraphTokenNoCatch(): Promise<string | null> {
  const token = await clientSecretCredential.getToken('https://graph.microsoft.com/.default');
  return token?.token ?? null;
}

/**
 * ❌ Missing: Used in API route handler without error handling
 */
async function apiHandlerNoCatch(scope: string): Promise<{ token: string }> {
  const tokenResponse = await clientSecretCredential.getToken(scope);
  return { token: tokenResponse?.token ?? '' };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. ManagedIdentityCredential — missing error handling
// ─────────────────────────────────────────────────────────────────────────────

const managedIdentityCredential = new ManagedIdentityCredential();

/**
 * ❌ Missing: ManagedIdentityCredential.getToken() without try-catch
 * Throws CredentialUnavailableError when not running in Azure environment.
 */
async function getManagedIdentityTokenNoCatch(): Promise<string | null> {
  const token = await managedIdentityCredential.getToken('https://storage.azure.com/.default');
  return token?.token ?? null;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. WorkloadIdentityCredential — missing error handling
// ─────────────────────────────────────────────────────────────────────────────

const workloadIdentityCredential = new WorkloadIdentityCredential({
  tenantId: process.env.AZURE_TENANT_ID!,
  clientId: process.env.AZURE_CLIENT_ID!,
  tokenFilePath: process.env.AZURE_FEDERATED_TOKEN_FILE!,
});

/**
 * ❌ Missing: WorkloadIdentityCredential.getToken() without try-catch
 */
async function getWorkloadIdentityTokenNoCatch(): Promise<string | null> {
  const token = await workloadIdentityCredential.getToken('https://storage.azure.com/.default');
  return token?.token ?? null;
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Class method patterns — missing error handling
// ─────────────────────────────────────────────────────────────────────────────

class BrokenAzureService {
  private credential: DefaultAzureCredential;

  constructor() {
    this.credential = new DefaultAzureCredential();
  }

  /**
   * ❌ Missing: class method without try-catch
   */
  async getToken(): Promise<string | null> {
    const token = await this.credential.getToken('https://storage.azure.com/.default');
    return token?.token ?? null;
  }
}
