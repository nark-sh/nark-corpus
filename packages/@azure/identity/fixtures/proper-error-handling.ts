/**
 * @azure/identity — Proper Error Handling Fixture
 *
 * All functions in this file use correct try-catch wrapping around getToken().
 * The V2 analyzer should produce ZERO violations for this file.
 *
 * Demonstrates correct patterns for:
 * - DefaultAzureCredential
 * - ClientSecretCredential
 * - ManagedIdentityCredential
 * - WorkloadIdentityCredential
 */

import {
  DefaultAzureCredential,
  ClientSecretCredential,
  ManagedIdentityCredential,
  WorkloadIdentityCredential,
  CredentialUnavailableError,
  AuthenticationError,
} from '@azure/identity';

// ─────────────────────────────────────────────────────────────────────────────
// 1. DefaultAzureCredential — most common pattern
// ─────────────────────────────────────────────────────────────────────────────

const defaultCredential = new DefaultAzureCredential();

/**
 * Proper: DefaultAzureCredential.getToken() with full error handling
 */
async function getStorageTokenWithFullHandling(): Promise<string | null> {
  try {
    const token = await defaultCredential.getToken('https://storage.azure.com/.default');
    return token?.token ?? null;
  } catch (err) {
    if (err instanceof CredentialUnavailableError) {
      console.error('No Azure credential configured — check managed identity or env vars:', err.message);
    } else if (err instanceof AuthenticationError) {
      console.error('Azure authentication failed:', err.message);
    } else {
      console.error('Unexpected error acquiring token:', err);
    }
    throw err;
  }
}

/**
 * Proper: DefaultAzureCredential.getToken() with generic catch and rethrow
 */
async function getManagementTokenWithGenericCatch(): Promise<string | null> {
  try {
    const token = await defaultCredential.getToken('https://management.azure.com/.default');
    return token?.token ?? null;
  } catch (err) {
    console.error('Failed to acquire management token:', err);
    throw err;
  }
}

/**
 * Proper: Outer try-catch wrapping an assigned call
 */
async function acquireStorageToken(): Promise<string | null> {
  const tokenScope = 'https://storage.azure.com/.default';
  let token;
  try {
    token = await defaultCredential.getToken(tokenScope);
  } catch (err) {
    console.error('Token acquisition failed:', err);
    return null;
  }
  return token?.token ?? null;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. ClientSecretCredential
// ─────────────────────────────────────────────────────────────────────────────

const clientSecretCredential = new ClientSecretCredential(
  process.env.AZURE_TENANT_ID!,
  process.env.AZURE_CLIENT_ID!,
  process.env.AZURE_CLIENT_SECRET!
);

/**
 * Proper: ClientSecretCredential.getToken() with error handling
 */
async function getGraphApiTokenWithHandling(): Promise<string | null> {
  try {
    const token = await clientSecretCredential.getToken('https://graph.microsoft.com/.default');
    return token?.token ?? null;
  } catch (err) {
    if (err instanceof AuthenticationError) {
      console.error('Client secret auth failed — check tenant ID and secret:', err.message);
    } else {
      console.error('Unexpected token acquisition error:', err);
    }
    throw err;
  }
}

/**
 * Proper: Multiple scopes with error handling
 */
async function getKeyVaultTokenWithHandling(): Promise<string | null> {
  try {
    const token = await clientSecretCredential.getToken('https://vault.azure.net/.default');
    return token?.token ?? null;
  } catch (err) {
    console.error('Key Vault token acquisition failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. ManagedIdentityCredential
// ─────────────────────────────────────────────────────────────────────────────

const managedIdentityCredential = new ManagedIdentityCredential();

/**
 * Proper: ManagedIdentityCredential.getToken() with error handling
 */
async function getManagedIdentityTokenWithHandling(): Promise<string | null> {
  try {
    const token = await managedIdentityCredential.getToken('https://storage.azure.com/.default');
    return token?.token ?? null;
  } catch (err) {
    if (err instanceof CredentialUnavailableError) {
      console.error('Managed identity not available — ensure running in Azure:', err.message);
    } else {
      console.error('Managed identity token error:', err);
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. WorkloadIdentityCredential
// ─────────────────────────────────────────────────────────────────────────────

const workloadIdentityCredential = new WorkloadIdentityCredential({
  tenantId: process.env.AZURE_TENANT_ID!,
  clientId: process.env.AZURE_CLIENT_ID!,
  tokenFilePath: process.env.AZURE_FEDERATED_TOKEN_FILE!,
});

/**
 * Proper: WorkloadIdentityCredential.getToken() with error handling
 */
async function getWorkloadIdentityTokenWithHandling(): Promise<string | null> {
  try {
    const token = await workloadIdentityCredential.getToken('https://storage.azure.com/.default');
    return token?.token ?? null;
  } catch (err) {
    console.error('Workload identity token acquisition failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Service class pattern — proper error handling in methods
// ─────────────────────────────────────────────────────────────────────────────

class AzureStorageService {
  private credential: DefaultAzureCredential;

  constructor() {
    this.credential = new DefaultAzureCredential();
  }

  async getAccessToken(): Promise<string | null> {
    try {
      const token = await this.credential.getToken('https://storage.azure.com/.default');
      return token?.token ?? null;
    } catch (err) {
      console.error('Failed to acquire storage access token:', err);
      throw err;
    }
  }

  async getBlobContent(containerName: string, blobName: string): Promise<void> {
    let token: string | null;
    try {
      const accessToken = await this.credential.getToken('https://storage.azure.com/.default');
      token = accessToken?.token ?? null;
    } catch (err) {
      console.error('Token acquisition failed for blob access:', err);
      throw err;
    }

    if (!token) {
      throw new Error('No token acquired');
    }
    console.log(`Would fetch ${containerName}/${blobName} with token`);
  }
}
