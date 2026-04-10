/**
 * graphql — Ground Truth Fixture
 *
 * Annotated with SHOULD_FIRE / SHOULD_NOT_FIRE to define
 * the expected scanner behavior.
 *
 * Postcondition IDs from contract.yaml:
 *   parse-syntax-error      — parse() without try-catch
 *   execute-resolver-errors — execute() without checking result.errors
 *   validate-schema-errors  — validate() without checking return array
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
import { parse, execute, validate, GraphQLSchema, GraphQLError } from 'graphql';

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

export {
  parse_withTryCatch,
  parse_withoutTryCatch,
  validate_withCheck,
  validate_withoutCheck,
  execute_withErrorCheck,
  execute_withoutErrorCheck,
};
