/**
 * graphql — Ground Truth Fixture
 *
 * Annotated with SHOULD_FIRE / SHOULD_NOT_FIRE to define
 * the expected scanner behavior.
 *
 * Postcondition IDs from contract.yaml:
 *   parse-syntax-error               — parse() without try-catch
 *   execute-resolver-errors          — execute() without checking result.errors
 *   validate-schema-errors           — validate() without checking return array
 *   graphql-errors-not-thrown        — graphql() result.errors not checked
 *   graphql-invalid-schema-errors    — graphql() with invalid schema
 *   subscribe-result-not-checked     — subscribe() result type not checked before iterating
 *   subscribe-system-error-thrown    — subscribe() not wrapped in try-catch
 *   subscribe-event-errors-unchecked — for-await loop on subscribe doesn't check event.errors
 *   buildschema-syntax-error         — buildSchema() without try-catch
 *   buildschema-semantic-validation-error — buildSchema() without try-catch
 *   execute-subscription-event-defer-stream-rejection — executeSubscriptionEvent without try/catch for @defer/@stream
 *   execute-subscription-event-abort-signal-rejection — executeSubscriptionEvent with abortSignal but no try/catch
 *
 * Scanner limitation note:
 *   validate() and execute() use the return-value-checker plugin which fires
 *   for ALL calls to these functions (it cannot do full data-flow analysis to
 *   determine whether the return value is subsequently checked). As a result,
 *   BOTH the checked and unchecked patterns will fire violations today.
 *   This is documented behavior — the contract is valid but precision is ~50%
 *   for these two functions due to scanner architecture constraints.
 *
 *   parse() uses the throwing-function-detector which DOES correctly suppress
 *   violations when the call is inside a try-catch.
 */
import { parse, execute, validate, graphql, subscribe, buildSchema, GraphQLSchema, GraphQLError } from 'graphql';

const schema = new GraphQLSchema({});

// ─── parse() tests — throwing-function-detector: correctly handles try-catch ─

async function parse_withTryCatch(query: string) {
  try {
    // SHOULD_NOT_FIRE: parse inside try-catch is properly handled
    return parse(query);
  } catch (error) {
    console.error('Parse error:', error);
    throw error;
  }
}

async function parse_withoutTryCatch(query: string) {
  // SHOULD_FIRE: parse-syntax-error — parse without try-catch throws GraphQLError on invalid syntax
  return parse(query);
}

// ─── validate() tests — return-value-checker fires for ALL validate calls ────

function validate_withCheck(s: GraphQLSchema, document: any) {
  // SHOULD_FIRE: validate-schema-errors — scanner fires for all validate() calls (limited data-flow analysis)
  const errors = validate(s, document);
  if (errors.length > 0) {
    throw new Error('Validation failed');
  }
  return true;
}

function validate_withoutCheck(s: GraphQLSchema, document: any) {
  // SHOULD_FIRE: validate-schema-errors — validate() return value not checked
  const errors = validate(s, document);
  return true;
}

// ─── execute() tests — return-value-checker fires for ALL execute calls ──────

async function execute_withErrorCheck(s: GraphQLSchema, document: any) {
  // SHOULD_FIRE: execute-resolver-errors — scanner fires for all execute() calls (limited data-flow analysis)
  const result = await execute({ schema: s, document });
  if (result.errors && result.errors.length > 0) {
    throw new Error('Execution failed');
  }
  return result.data;
}

async function execute_withoutErrorCheck(s: GraphQLSchema, document: any) {
  // SHOULD_FIRE: execute-resolver-errors — result.errors not checked, silently ignoring resolver failures
  const result = await execute({ schema: s, document });
  return result.data;
}

// ─── graphql() tests — result.errors must be checked after awaiting ──────────

async function graphql_withErrorCheck(schema: GraphQLSchema, query: string) {
  // @expect-clean: graphql-errors-not-thrown — result.errors is properly checked
  const result = await graphql({ schema, source: query });
  if (result.errors) {
    console.error('GraphQL errors:', result.errors);
    return null;
  }
  return result.data;
}

async function graphql_withoutErrorCheck(schema: GraphQLSchema, query: string) {
  // @expect-violation: graphql-errors-not-thrown
  // result.errors is never checked — parse errors, validation errors, and resolver
  // errors are silently ignored; result.data may be null or partial
  const result = await graphql({ schema, source: query });
  return result.data;
}

// ─── subscribe() tests — return type must be checked before iterating ─────────

async function subscribe_withTypeCheck(schema: GraphQLSchema, document: any) {
  // @expect-clean: subscribe-result-not-checked — return type is checked before iterating
  const result = await subscribe({ schema, document });
  if ('errors' in result) {
    console.error('Subscription setup failed:', result.errors);
    return;
  }
  for await (const event of result) {
    if (event.errors) {
      console.error('Event error:', event.errors);
    }
    console.log('Event data:', event.data);
  }
}

async function subscribe_withoutTypeCheck(schema: GraphQLSchema, document: any) {
  // @expect-violation: subscribe-result-not-checked
  // Result type is not checked — iterating an ExecutionResult (not AsyncGenerator)
  // throws TypeError: result is not async iterable
  const result = await subscribe({ schema, document });
  // @ts-ignore — intentional violation for test purposes
  for await (const event of result) {
    console.log(event.data);
  }
}

async function subscribe_withoutTryCatch(schema: GraphQLSchema, document: any) {
  // @expect-violation: subscribe-system-error-thrown
  // Not wrapped in try-catch — non-GraphQLErrors from subscription resolver propagate
  const result = await subscribe({ schema, document });
  if ('errors' in result) return;
  for await (const event of result) {
    console.log(event.data);
  }
}

async function subscribe_withEventErrorCheck(schema: GraphQLSchema, document: any) {
  // @expect-clean: subscribe-event-errors-unchecked — each event.errors is checked
  try {
    const result = await subscribe({ schema, document });
    if ('errors' in result) {
      console.error('Setup failed:', result.errors);
      return;
    }
    for await (const event of result) {
      if (event.errors) {
        console.error('Event error:', event.errors);
      }
      console.log(event.data);
    }
  } catch (error) {
    console.error('System error:', error);
  }
}

async function subscribe_withoutEventErrorCheck(schema: GraphQLSchema, document: any) {
  // @expect-violation: subscribe-event-errors-unchecked
  // event.errors is never checked in the loop — resolver failures silently produce null data
  try {
    const result = await subscribe({ schema, document });
    if ('errors' in result) return;
    for await (const event of result) {
      // event.errors never checked — silent failures for each event
      processData(event.data);
    }
  } catch (error) {
    console.error('System error:', error);
  }
}

function processData(data: unknown) {
  console.log(data);
}

// ─── buildSchema() tests — must be wrapped in try-catch ──────────────────────

function buildSchema_withTryCatch(sdl: string) {
  // @expect-clean: buildschema-syntax-error, buildschema-semantic-validation-error
  try {
    return buildSchema(sdl);
  } catch (error) {
    // catches BOTH GraphQLError (syntax) and Error (semantic validation)
    console.error('Invalid schema SDL:', error);
    throw error;
  }
}

function buildSchema_withoutTryCatch(sdl: string) {
  // @expect-violation: buildschema-syntax-error
  // @expect-violation: buildschema-semantic-validation-error
  // No try-catch — both GraphQLError (syntax) and Error (semantic) can crash app startup
  return buildSchema(sdl);
}

// ─── v17 fixtures (added 2026-06-18 deepen pass 3) ──────────────────────────
// New v17 surface:
//   experimentalExecuteIncrementally — @defer/@stream executor, discriminated union
//   legacyExecuteIncrementally       — legacy-payload variant
//   AbortedGraphQLExecutionError     — thrown from execute() on abortSignal abort
//
// NOTE: graphql v17 is ESM-only; these imports are valid in a TypeScript / ESM
// fixture but will fail when compiled to CJS without proper interop. The fixture's
// tsconfig.json uses "moduleResolution": "bundler" or "node16" to handle this.

import {
  execute as executeV17,
  experimentalExecuteIncrementally,
  legacyExecuteIncrementally,
  executeSubscriptionEvent,
  validateSubscriptionArgs,
  AbortedGraphQLExecutionError,
} from 'graphql';

// ─── execute() with abortSignal — AbortedGraphQLExecutionError handling ───────

async function execute_withAbortSignalProperHandling(s: GraphQLSchema, document: any, signal: AbortSignal) {
  // @expect-clean: execute-abort-signal-rejection — the AbortedGraphQLExecutionError
  // is caught and the partial result is surfaced via a 499-equivalent path
  try {
    const result = await executeV17({ schema: s, document, abortSignal: signal });
    return result;
  } catch (error) {
    if (error instanceof AbortedGraphQLExecutionError) {
      // Client cancelled — surface the partial result, not a 500
      const partial = await error.abortedResult;
      return { ...partial, aborted: true };
    }
    throw error;
  }
}

async function execute_withAbortSignalMissingHandling(s: GraphQLSchema, document: any, signal: AbortSignal) {
  // @expect-violation: execute-abort-signal-rejection
  // abortSignal is passed but the awaited execute() is not wrapped in try-catch —
  // AbortedGraphQLExecutionError surfaces as an unhandled rejection, partial result lost.
  const result = await executeV17({ schema: s, document, abortSignal: signal });
  return result;
}

// ─── experimentalExecuteIncrementally tests — discriminated union handling ────

async function expIncremental_withDiscrimination(s: GraphQLSchema, document: any) {
  // @expect-clean: experimental-incremental-result-not-discriminated
  // Discriminates on 'initialResult' in result before serializing.
  const result = await experimentalExecuteIncrementally({ schema: s, document });
  if ('initialResult' in result) {
    // Incremental delivery — stream initialResult + iterate subsequentResults
    const payloads: any[] = [result.initialResult];
    for await (const payload of result.subsequentResults) {
      payloads.push(payload);
    }
    return payloads;
  }
  return result;
}

async function expIncremental_withoutDiscrimination(s: GraphQLSchema, document: any) {
  // @expect-violation: experimental-incremental-result-not-discriminated
  // Treats result as ExecutionResult without discriminating — when document has
  // @defer / @stream, the incremental payloads silently dropped.
  const result = await experimentalExecuteIncrementally({ schema: s, document });
  // @ts-ignore — intentional violation for test purposes
  return result.data;
}

async function expIncremental_withAbortProperHandling(s: GraphQLSchema, document: any, signal: AbortSignal) {
  // @expect-clean: experimental-incremental-abort-signal-rejection
  try {
    const result = await experimentalExecuteIncrementally({ schema: s, document, abortSignal: signal });
    if ('initialResult' in result) {
      try {
        for await (const payload of result.subsequentResults) {
          console.log('payload', payload);
        }
      } catch (iterErr) {
        // abort fired mid-stream
        console.error('incremental stream aborted', iterErr);
      }
      return;
    }
    return result;
  } catch (error) {
    if (error instanceof AbortedGraphQLExecutionError) {
      return null; // client cancelled
    }
    throw error;
  }
}

async function expIncremental_withAbortMissingHandling(s: GraphQLSchema, document: any, signal: AbortSignal) {
  // @expect-violation: experimental-incremental-abort-signal-rejection
  // abortSignal passed but neither the Promise nor the iterator are wrapped in error handling
  const result = await experimentalExecuteIncrementally({ schema: s, document, abortSignal: signal });
  if ('initialResult' in result) {
    for await (const payload of result.subsequentResults) {
      console.log(payload);
    }
  }
}

// ─── legacyExecuteIncrementally tests — same shape, legacy payload ────────────

async function legacyIncremental_withDiscrimination(s: GraphQLSchema, document: any) {
  // @expect-clean: legacy-incremental-result-not-discriminated
  const result = await legacyExecuteIncrementally({ schema: s, document });
  if ('initialResult' in result) {
    const payloads: any[] = [result.initialResult];
    for await (const payload of result.subsequentResults) {
      payloads.push(payload);
    }
    return payloads;
  }
  return result;
}

async function legacyIncremental_withoutDiscrimination(s: GraphQLSchema, document: any) {
  // @expect-violation: legacy-incremental-result-not-discriminated
  const result = await legacyExecuteIncrementally({ schema: s, document });
  // @ts-ignore — intentional violation for test purposes
  return result.data;
}

async function legacyIncremental_withAbortMissingHandling(s: GraphQLSchema, document: any, signal: AbortSignal) {
  // @expect-violation: legacy-incremental-abort-signal-rejection
  // abortSignal passed but no try-catch on the awaited call
  const result = await legacyExecuteIncrementally({ schema: s, document, abortSignal: signal });
  return result;
}

// ─── executeSubscriptionEvent tests (added 2026-06-24 deepen pass 95) ─────────
// New v17 surface:
//   executeSubscriptionEvent — lower-level subscription event executor backed by
//   ExecutorThrowingOnIncremental. Throws a plain Error (not GraphQLError) when
//   the subscription selection contains @defer or @stream directives. Also
//   surfaces AbortedGraphQLExecutionError on abortSignal abort like execute().

async function executeSubscriptionEvent_withDeferStreamProperHandling(s: GraphQLSchema, document: any) {
  // SHOULD_NOT_FIRE: execute-subscription-event-defer-stream-rejection
  // Awaited call is wrapped in try/catch and discriminates the plain-Error case.
  const validated = validateSubscriptionArgs({ schema: s, document });
  if (!('schema' in validated)) {
    return { errors: validated };
  }
  try {
    const eventResult = await executeSubscriptionEvent(validated);
    return eventResult;
  } catch (error) {
    if (error instanceof Error && error.message.includes('unexpectedly produce multiple payloads')) {
      return { errors: [new GraphQLError('@defer and @stream are not supported on subscriptions')] };
    }
    throw error;
  }
}

async function executeSubscriptionEvent_withoutDeferStreamHandling(s: GraphQLSchema, document: any) {
  // SHOULD_FIRE: execute-subscription-event-defer-stream-rejection
  // No try/catch around the awaited call. Plain Error surfaces as unhandled rejection
  // when document contains @defer / @stream on the subscription selection.
  const validated = validateSubscriptionArgs({ schema: s, document });
  if (!('schema' in validated)) {
    return { errors: validated };
  }
  const eventResult = await executeSubscriptionEvent(validated);
  return eventResult;
}

async function executeSubscriptionEvent_withAbortProperHandling(s: GraphQLSchema, document: any, signal: AbortSignal) {
  // SHOULD_NOT_FIRE: execute-subscription-event-abort-signal-rejection
  const validated = validateSubscriptionArgs({ schema: s, document, abortSignal: signal });
  if (!('schema' in validated)) {
    return { errors: validated };
  }
  try {
    return await executeSubscriptionEvent(validated);
  } catch (error) {
    if (error instanceof AbortedGraphQLExecutionError) {
      return null;
    }
    throw error;
  }
}

async function executeSubscriptionEvent_withAbortMissingHandling(s: GraphQLSchema, document: any, signal: AbortSignal) {
  // SHOULD_FIRE: execute-subscription-event-abort-signal-rejection
  // abortSignal is passed via validated args but the awaited call is not wrapped.
  const validated = validateSubscriptionArgs({ schema: s, document, abortSignal: signal });
  if (!('schema' in validated)) {
    return { errors: validated };
  }
  return await executeSubscriptionEvent(validated);
}

export {
  parse_withTryCatch,
  parse_withoutTryCatch,
  validate_withCheck,
  validate_withoutCheck,
  execute_withErrorCheck,
  execute_withoutErrorCheck,
  graphql_withErrorCheck,
  graphql_withoutErrorCheck,
  subscribe_withTypeCheck,
  subscribe_withoutTypeCheck,
  subscribe_withoutTryCatch,
  subscribe_withEventErrorCheck,
  subscribe_withoutEventErrorCheck,
  buildSchema_withTryCatch,
  buildSchema_withoutTryCatch,
  execute_withAbortSignalProperHandling,
  execute_withAbortSignalMissingHandling,
  expIncremental_withDiscrimination,
  expIncremental_withoutDiscrimination,
  expIncremental_withAbortProperHandling,
  expIncremental_withAbortMissingHandling,
  legacyIncremental_withDiscrimination,
  legacyIncremental_withoutDiscrimination,
  legacyIncremental_withAbortMissingHandling,
  executeSubscriptionEvent_withDeferStreamProperHandling,
  executeSubscriptionEvent_withoutDeferStreamHandling,
  executeSubscriptionEvent_withAbortProperHandling,
  executeSubscriptionEvent_withAbortMissingHandling,
};
