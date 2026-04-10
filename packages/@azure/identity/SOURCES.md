# Sources: @azure/identity

All behavioral claims in `contract.yaml` are derived from the following sources.

---

## Official Microsoft Documentation

### Azure Identity README (JavaScript SDK)
- **URL:** https://learn.microsoft.com/en-us/javascript/api/overview/azure/identity-readme
- **Relevance:** Authoritative overview of all credential classes, the TokenCredential interface, getToken() signature, and error types (CredentialUnavailableError, AuthenticationError).

### Azure Authentication for JavaScript SDK
- **URL:** https://learn.microsoft.com/en-us/azure/developer/javascript/sdk/authentication/overview
- **Relevance:** Documents best practices for authentication, notes that all credential.getToken() calls are async and network-dependent, and recommends wrapping in try-catch.

### @azure/identity Troubleshooting Guide
- **URL:** https://github.com/Azure/azure-sdk-for-js/blob/main/sdk/identity/identity/TROUBLESHOOTING.md
- **Key claim:** Documents CredentialUnavailableError (no valid credential source), AuthenticationError (AAD returned error response), and CredentialUnavailableChainedError (all chain entries failed).

### @azure/identity GitHub Repository
- **URL:** https://github.com/Azure/azure-sdk-for-js/tree/main/sdk/identity/identity
- **Relevance:** Source of truth for TypeScript types, exported error classes, and credential implementations.

---

## Error Type Documentation

### CredentialUnavailableError
- Thrown by DefaultAzureCredential and ManagedIdentityCredential when no credential source is available
- Indicates configuration/environment issue (not wrong credentials — no credentials at all)
- Common trigger: deploying outside Azure without environment variables set

### AuthenticationError
- Thrown when Azure AD / Entra ID returns an error response
- Contains `errorResponse` property with `error` (code) and `errorDescription`
- Common trigger: wrong client secret, expired certificate, invalid tenant ID

---

## SDK Version History

- `@azure/identity` v4.x: Added WorkloadIdentityCredential, improved MSAL caching
- `@azure/identity` v3.x: Stable DefaultAzureCredential chain, AzureDeveloperCliCredential added
- All 3.x and 4.x versions: Same `getToken()` signature and error types

Contract covers semver range `^3.0.0`.

---

## Real-World Usage Context

### Common SaaS patterns using @azure/identity
1. Azure-hosted services using ManagedIdentityCredential (via DefaultAzureCredential) to authenticate to storage, Key Vault, or databases
2. Node.js backends using ClientSecretCredential to call Microsoft Graph API for M365 integration
3. CI/CD pipelines using WorkloadIdentityCredential for federated access

All patterns share the same `getToken()` call and the same error behavior.

---

## Error Handling Best Practice (from official docs)

```typescript
import {
  DefaultAzureCredential,
  CredentialUnavailableError,
  AuthenticationError,
} from '@azure/identity';

const credential = new DefaultAzureCredential();

try {
  const token = await credential.getToken('https://storage.azure.com/.default');
  // token.token is the Bearer token string
} catch (err) {
  if (err instanceof CredentialUnavailableError) {
    // No credential source configured
    // Check: managed identity, env vars (AZURE_CLIENT_ID etc.), Azure CLI
    console.error('No Azure credential available:', err.message);
  } else if (err instanceof AuthenticationError) {
    // Credential found but auth failed
    // Check: tenant ID, client secret expiry, certificate validity
    console.error('Azure auth failed:', err.errorResponse?.errorDescription);
  } else {
    // Network error, unexpected failure
    console.error('getToken() unexpected error:', err);
  }
  throw err;
}
```

Source: https://learn.microsoft.com/en-us/javascript/api/overview/azure/identity-readme#credential-classes
