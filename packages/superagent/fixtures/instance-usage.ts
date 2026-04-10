/**
 * SuperAgent - Instance Usage Patterns
 *
 * Tests detection of SuperAgent usage via various import patterns,
 * destructured imports, and agent instances.
 */

import request from 'superagent';
import * as superagent from 'superagent';

/**
 * Pattern 1: Direct import as 'request'
 * ✅ PROPER - With error handling
 */
async function usingRequestAlias() {
  try {
    const res = await request.get('https://api.example.com/data');
    return res.body;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

/**
 * Pattern 2: Direct import as 'request' - WITHOUT error handling
 * ❌ Should trigger violation
 */
async function usingRequestAliasNoCatch() {
  const res = await request.get('https://api.example.com/data');
  return res.body;
}

/**
 * Pattern 3: Using superagent namespace
 * ✅ PROPER - With error handling
 */
async function usingSuperagentNamespace() {
  try {
    const res = await superagent.get('https://api.example.com/data');
    return res.body;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

/**
 * Pattern 4: Using superagent namespace - WITHOUT error handling
 * ❌ Should trigger violation
 */
async function usingSuperagentNamespaceNoCatch() {
  const res = await superagent.get('https://api.example.com/data');
  return res.body;
}

/**
 * Pattern 5: Agent instance with proper error handling
 * ✅ PROPER - Agent with error handling
 */
class ApiClientWithAgent {
  private agent: any;

  constructor() {
    this.agent = request.agent();
    this.agent.set('Authorization', 'Bearer token123');
  }

  async fetchUsers() {
    try {
      const res = await this.agent.get('https://api.example.com/users');
      return res.body;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }
}

/**
 * Pattern 6: Agent instance WITHOUT error handling
 * ❌ Should trigger violation
 */
class BadApiClientWithAgent {
  private agent: any;

  constructor() {
    this.agent = request.agent();
  }

  async fetchUsers() {
    const res = await this.agent.get('https://api.example.com/users');
    return res.body;
  }
}

/**
 * Pattern 7: Chained methods with proper error handling
 * ✅ PROPER - Long chain with error handling
 */
async function chainedMethodsProper() {
  try {
    const res = await request
      .post('https://api.example.com/submit')
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer token')
      .query({ debug: true })
      .send({ data: 'test' })
      .timeout(5000)
      .retry(2);
    return res.body;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

/**
 * Pattern 8: Chained methods WITHOUT error handling
 * ❌ Should trigger violation
 */
async function chainedMethodsNoErrorHandling() {
  const res = await request
    .post('https://api.example.com/submit')
    .set('Content-Type', 'application/json')
    .send({ data: 'test' })
    .timeout(5000);
  return res.body;
}

/**
 * Pattern 9: Using .del() with proper error handling
 * ✅ PROPER - Legacy delete method
 */
async function deletingWithDelMethod() {
  try {
    const res = await request.del('https://api.example.com/resource/123');
    return res.status === 204;
  } catch (err) {
    console.error(err);
    return false;
  }
}

/**
 * Pattern 10: Using .del() WITHOUT error handling
 * ❌ Should trigger violation
 */
async function deletingWithDelMethodNoCatch() {
  const res = await request.del('https://api.example.com/resource/123');
  return res.status === 204;
}

/**
 * Pattern 11: All HTTP methods in one function - WITH error handling
 * ✅ PROPER - Testing all methods
 */
async function testAllMethodsProper() {
  try {
    await request.get('https://api.example.com/users');
    await request.post('https://api.example.com/users').send({ name: 'John' });
    await request.put('https://api.example.com/users/1').send({ name: 'Jane' });
    await request.patch('https://api.example.com/users/1').send({ active: true });
    await request.delete('https://api.example.com/users/1');
    await request.head('https://api.example.com/users');
  } catch (err) {
    console.error('One or more requests failed:', err);
    throw err;
  }
}

/**
 * Pattern 12: All HTTP methods WITHOUT error handling
 * ❌ Should trigger 6 violations (one for each method)
 */
async function testAllMethodsNoCatch() {
  await request.get('https://api.example.com/users');
  await request.post('https://api.example.com/users').send({ name: 'John' });
  await request.put('https://api.example.com/users/1').send({ name: 'Jane' });
  await request.patch('https://api.example.com/users/1').send({ active: true });
  await request.delete('https://api.example.com/users/1');
  await request.head('https://api.example.com/users');
}

/**
 * Pattern 13: Destructured get/post
 * Note: This is uncommon but technically possible
 */
const { get, post } = request;

/**
 * Using destructured methods WITH error handling
 * ✅ PROPER
 */
async function usingDestructuredProper() {
  try {
    const res = await get('https://api.example.com/data');
    return res.body;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

/**
 * Using destructured methods WITHOUT error handling
 * ❌ Should trigger violation (if analyzer supports destructured detection)
 */
async function usingDestructuredNoCatch() {
  const res = await get('https://api.example.com/data');
  return res.body;
}

export {
  usingRequestAlias,
  usingRequestAliasNoCatch,
  usingSuperagentNamespace,
  usingSuperagentNamespaceNoCatch,
  ApiClientWithAgent,
  BadApiClientWithAgent,
  chainedMethodsProper,
  chainedMethodsNoErrorHandling,
  deletingWithDelMethod,
  deletingWithDelMethodNoCatch,
  testAllMethodsProper,
  testAllMethodsNoCatch,
  usingDestructuredProper,
  usingDestructuredNoCatch
};
