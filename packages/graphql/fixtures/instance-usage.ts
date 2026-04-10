/**
 * Instance Usage for GraphQL
 */

import { parse, execute, validate, GraphQLSchema } from 'graphql';

class GraphQLService {
  private schema: GraphQLSchema;
  
  constructor(schema: GraphQLSchema) {
    this.schema = schema;
  }
  
  // ❌ No try-catch
  parseQuery(query: string) {
    return parse(query);
  }
  
  // ❌ Not checking errors
  async executeQuery(document: any) {
    const result = await execute({ schema: this.schema, document });
    return result.data;
  }
}

// ❌ Module-level operations without error handling
parse('query { user }');

export { GraphQLService };
