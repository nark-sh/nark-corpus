/**
 * @azure/identity Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions (from import "@azure/identity"):
 *   - credential.getToken()  postcondition: get-token-no-try-catch
 *
 * Detection pattern:
 *   - Credential class imported from @azure/identity
 *   - new DefaultAzureCredential() / new ClientSecretCredential() etc. tracked → credential instance resolved to package
 *   - ThrowingFunctionDetector (depth-1): credential.getToken() → detected
 *   - ContractMatcher: matches function 'getToken' → checks try-catch
 */

import {
  DefaultAzureCredential,
  ClientSecretCredential,
  ManagedIdentityCredential,
  WorkloadIdentityCredential,
  CredentialUnavailableError,
  AuthenticationError,
} from '@azure/identity';

const defaultCredential = new DefaultAzureCredential();
const clientSecretCredential = new ClientSecretCredential(
  'tenant-id',
  'client-id',
  'client-secret'
);
const managedCredential = new ManagedIdentityCredential();
const workloadCredential = new WorkloadIdentityCredential({
  tenantId: 'tenant-id',
  clientId: 'client-id',
  tokenFilePath: '/var/run/secrets/token',
});

// ─────────────────────────────────────────────────────────────────────────────
// 1. DefaultAzureCredential — basic cases
// ─────────────────────────────────────────────────────────────────────────────

export async function defaultNoCatch(): Promise<string | null> {
  // SHOULD_FIRE: get-token-no-try-catch — DefaultAzureCredential.getToken() without try-catch; throws CredentialUnavailableError
  const token = await defaultCredential.getToken('https://storage.azure.com/.default');
  return token?.token ?? null;
}

export async function defaultWithCatch(): Promise<string | null> {
  try {
    // SHOULD_NOT_FIRE: getToken inside try-catch satisfies error handling
    const token = await defaultCredential.getToken('https://storage.azure.com/.default');
    return token?.token ?? null;
  } catch (err) {
    if (err instanceof CredentialUnavailableError) {
      console.error('No credential configured:', err.message);
    }
    throw err;
  }
}

export async function defaultNoCatchMultipleScopes(): Promise<string | null> {
  // SHOULD_FIRE: get-token-no-try-catch — DefaultAzureCredential.getToken() with array scopes, no try-catch
  const token = await defaultCredential.getToken(['https://storage.azure.com/.default']);
  return token?.token ?? null;
}

export async function defaultWithCatchGeneric(): Promise<string | null> {
  try {
    // SHOULD_NOT_FIRE: generic catch block satisfies requirement
    const token = await defaultCredential.getToken('https://management.azure.com/.default');
    return token?.token ?? null;
  } catch (err) {
    console.error('Token error:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. ClientSecretCredential
// ─────────────────────────────────────────────────────────────────────────────

export async function clientSecretNoCatch(): Promise<string | null> {
  // SHOULD_FIRE: get-token-no-try-catch — ClientSecretCredential.getToken() without try-catch; throws AuthenticationError on invalid secret
  const token = await clientSecretCredential.getToken('https://graph.microsoft.com/.default');
  return token?.token ?? null;
}

export async function clientSecretWithCatch(): Promise<string | null> {
  try {
    // SHOULD_NOT_FIRE: ClientSecretCredential.getToken() inside try-catch
    const token = await clientSecretCredential.getToken('https://graph.microsoft.com/.default');
    return token?.token ?? null;
  } catch (err) {
    if (err instanceof AuthenticationError) {
      console.error('Auth error:', err.message);
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. ManagedIdentityCredential
// ─────────────────────────────────────────────────────────────────────────────

export async function managedIdentityNoCatch(): Promise<string | null> {
  // SHOULD_FIRE: get-token-no-try-catch — ManagedIdentityCredential.getToken() without try-catch; throws CredentialUnavailableError outside Azure
  const token = await managedCredential.getToken('https://storage.azure.com/.default');
  return token?.token ?? null;
}

export async function managedIdentityWithCatch(): Promise<string | null> {
  try {
    // SHOULD_NOT_FIRE: ManagedIdentityCredential.getToken() inside try-catch
    const token = await managedCredential.getToken('https://storage.azure.com/.default');
    return token?.token ?? null;
  } catch (err) {
    if (err instanceof CredentialUnavailableError) {
      console.error('Managed identity unavailable:', err.message);
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. WorkloadIdentityCredential
// ─────────────────────────────────────────────────────────────────────────────

export async function workloadIdentityNoCatch(): Promise<string | null> {
  // SHOULD_FIRE: get-token-no-try-catch — WorkloadIdentityCredential.getToken() without try-catch
  const token = await workloadCredential.getToken('https://storage.azure.com/.default');
  return token?.token ?? null;
}

export async function workloadIdentityWithCatch(): Promise<string | null> {
  try {
    // SHOULD_NOT_FIRE: WorkloadIdentityCredential.getToken() inside try-catch
    const token = await workloadCredential.getToken('https://storage.azure.com/.default');
    return token?.token ?? null;
  } catch (err) {
    console.error('Workload identity error:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Local instances (created in function scope)
// ─────────────────────────────────────────────────────────────────────────────

export async function localDefaultNoCatch(): Promise<string | null> {
  const cred = new DefaultAzureCredential();
  // SHOULD_FIRE: get-token-no-try-catch — local DefaultAzureCredential instance, getToken() without try-catch
  const token = await cred.getToken('https://vault.azure.net/.default');
  return token?.token ?? null;
}

export async function localDefaultWithCatch(): Promise<string | null> {
  const cred = new DefaultAzureCredential();
  try {
    // SHOULD_NOT_FIRE: local instance getToken() inside try-catch
    const token = await cred.getToken('https://vault.azure.net/.default');
    return token?.token ?? null;
  } catch (err) {
    console.error('Token error:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Class method patterns
// ─────────────────────────────────────────────────────────────────────────────

class AzureTokenManager {
  private credential = new DefaultAzureCredential();

  async getTokenNoCatch(): Promise<string | null> {
    // SHOULD_FIRE: get-token-no-try-catch — class method calling getToken() without try-catch
    const token = await this.credential.getToken('https://storage.azure.com/.default');
    return token?.token ?? null;
  }

  async getTokenWithCatch(): Promise<string | null> {
    try {
      // SHOULD_NOT_FIRE: class method with try-catch wrapping getToken()
      const token = await this.credential.getToken('https://storage.azure.com/.default');
      return token?.token ?? null;
    } catch (err) {
      console.error('Token error in class method:', err);
      throw err;
    }
  }
}
