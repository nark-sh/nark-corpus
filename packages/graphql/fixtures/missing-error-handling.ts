/**
 * Missing GraphQL Error Handling
 * Should produce ERROR violations
 */

import { parse, execute, validate, GraphQLSchema } from 'graphql';

const schema = new GraphQLSchema({});

// ❌ No try-catch around parse
function parseNoErrorHandling(query: string) {
  const document = parse(query);
  return document;
}

// ❌ Not checking validate() return value
function validateNoCheck(schema: GraphQLSchema, document: any) {
  const errors = validate(schema, document);
  return true; // ❌ Not checking errors array
}

// ❌ Not checking execute() result errors
async function executeNoErrorCheck(schema: GraphQLSchema, document: any) {
  const result = await execute({ schema, document });
  return result.data; // ❌ Not checking result.errors
}

export { parseNoErrorHandling, validateNoCheck, executeNoErrorCheck };
