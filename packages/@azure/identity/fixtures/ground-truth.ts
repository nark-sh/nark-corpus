/**
 * @azure/identity Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions (from import "@azure/identity"):
 *   - credential.getToken()         postcondition: get-token-no-try-catch
 *   - getBearerTokenProvider()      postcondition: bearer-token-provider-no-try-catch
 *   - credential.authenticate()     postcondition: interactive-authenticate-no-try-catch
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
  InteractiveBrowserCredential,
  DeviceCodeCredential,
  CredentialUnavailableError,
  AuthenticationError,
  getBearerTokenProvider,
  serializeAuthenticationRecord,
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

// ─────────────────────────────────────────────────────────────────────────────
// 7. getBearerTokenProvider — callback error handling
// ─────────────────────────────────────────────────────────────────────────────

const credential = new DefaultAzureCredential();
const scope = 'https://cognitiveservices.azure.com/.default';

export async function bearerTokenProviderNoCatch(): Promise<string> {
  // SHOULD_FIRE: bearer-token-provider-no-try-catch
  // getBearerTokenProvider() callback called without try-catch
  // throws Error("Failed to get access token") when credential fails
  const getToken = getBearerTokenProvider(credential, scope);
  const token = await getToken();
  return token;
}

export async function bearerTokenProviderWithCatch(): Promise<string> {
  const getToken = getBearerTokenProvider(credential, scope);
  try {
    // SHOULD_NOT_FIRE: getBearerTokenProvider callback wrapped in try-catch
    const token = await getToken();
    return token;
  } catch (err) {
    if (err instanceof CredentialUnavailableError) {
      console.error('Azure credential not available:', err.message);
    } else {
      console.error('Failed to get bearer token:', err);
    }
    throw err;
  }
}

export async function bearerTokenProviderInlineNoCatch(): Promise<void> {
  // SHOULD_FIRE: bearer-token-provider-no-try-catch
  // Inline usage: callback created and immediately awaited, no try-catch
  const token = await getBearerTokenProvider(credential, scope)();
  console.log('token:', token);
}

export async function bearerTokenProviderInlineWithCatch(): Promise<void> {
  try {
    // SHOULD_NOT_FIRE: inline getBearerTokenProvider call wrapped in try-catch
    const token = await getBearerTokenProvider(credential, scope)();
    console.log('token:', token);
  } catch (err) {
    console.error('Token acquisition failed:', err);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. InteractiveBrowserCredential.authenticate() — interactive OAuth flow
// ─────────────────────────────────────────────────────────────────────────────

const interactiveCredential = new InteractiveBrowserCredential({
  clientId: process.env.AZURE_CLIENT_ID ?? 'mock-client-id',
  redirectUri: 'http://localhost:3000/auth/callback',
});

export async function interactiveAuthNoCatch(): Promise<string | undefined> {
  // SHOULD_FIRE: interactive-authenticate-no-try-catch
  // authenticate() can throw CredentialUnavailableError or AuthenticationError
  const record = await interactiveCredential.authenticate(['User.Read']);
  // Also SHOULD_FIRE if record is used with non-null assertion without null check
  return record ? serializeAuthenticationRecord(record) : undefined;
}

export async function interactiveAuthWithCatch(): Promise<string | undefined> {
  try {
    // SHOULD_NOT_FIRE: authenticate() wrapped in try-catch with null check
    const record = await interactiveCredential.authenticate(['User.Read']);
    if (record) {
      return serializeAuthenticationRecord(record);
    }
    return undefined;
  } catch (err) {
    if (err instanceof CredentialUnavailableError) {
      console.error('Interactive auth failed:', err.message);
    } else if (err instanceof AuthenticationError) {
      console.error('Auth rejected:', err.errorResponse.error, err.errorResponse.errorDescription);
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. DeviceCodeCredential.authenticate() — device code OAuth flow (CLI/headless)
// ─────────────────────────────────────────────────────────────────────────────

const deviceCodeCredential = new DeviceCodeCredential({
  tenantId: process.env.AZURE_TENANT_ID ?? 'mock-tenant-id',
  clientId: process.env.AZURE_CLIENT_ID ?? 'mock-client-id',
});

export async function deviceCodeAuthNoCatch(): Promise<string | undefined> {
  // SHOULD_FIRE: device-code-authenticate-no-try-catch — DeviceCodeCredential.authenticate() without try-catch; throws CredentialUnavailableError on device code expiry
  const record = await deviceCodeCredential.authenticate(['User.Read']);
  return record ? serializeAuthenticationRecord(record) : undefined;
}

export async function deviceCodeAuthWithCatch(): Promise<string | undefined> {
  try {
    // SHOULD_NOT_FIRE: DeviceCodeCredential.authenticate() wrapped in try-catch with null check
    const record = await deviceCodeCredential.authenticate(['User.Read']);
    if (record) {
      return serializeAuthenticationRecord(record);
    }
    return undefined;
  } catch (err) {
    if (err instanceof CredentialUnavailableError) {
      console.error('Device code auth failed:', err.message);
    } else if (err instanceof AuthenticationError) {
      console.error('Auth rejected:', err.errorResponse.error, err.errorResponse.errorDescription);
    }
    throw err;
  }
}

export async function deviceCodeAuthLocalNoCatch(): Promise<string | undefined> {
  const cred = new DeviceCodeCredential({
    tenantId: 'tenant-id',
    clientId: 'client-id',
  });
  // SHOULD_FIRE: device-code-authenticate-no-try-catch — local DeviceCodeCredential instance, authenticate() without try-catch
  const record = await cred.authenticate(['https://graph.microsoft.com/.default']);
  return record ? serializeAuthenticationRecord(record) : undefined;
}
