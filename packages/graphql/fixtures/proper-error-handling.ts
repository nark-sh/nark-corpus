/**
 * Proper GraphQL Error Handling
 * Should produce 0 violations
 */

import { parse, execute, validate, GraphQLSchema, GraphQLError } from 'graphql';

const schema = new GraphQLSchema({});

// ✅ Try-catch around parse
function parseQuery(query: string) {
  try {
    const document = parse(query);
    return document;
  } catch (error) {
    if (error instanceof GraphQLError) {
      console.error('Parse error:', error.message);
    }
    throw error;
  }
}

// ✅ Check validate() return value
function validateQuery(schema: GraphQLSchema, document: any) {
  const errors = validate(schema, document);
  if (errors.length > 0) {
    console.error('Validation errors:', errors);
    throw new Error('Query validation failed');
  }
  return true;
}

// ✅ Check execute() result for errors
async function executeQuery(schema: GraphQLSchema, document: any) {
  const result = await execute({ schema, document });
  
  if (result.errors && result.errors.length > 0) {
    console.error('Execution errors:', result.errors);
    throw new Error('Query execution failed');
  }
  
  return result.data;
}

export { parseQuery, validateQuery, executeQuery };
