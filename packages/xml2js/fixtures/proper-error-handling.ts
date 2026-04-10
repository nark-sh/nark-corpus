/**
 * Fixtures: proper error handling for xml2js
 * These patterns should produce 0 violations.
 */

import xml2js from 'xml2js';
import { parseStringPromise, Parser } from 'xml2js';

/**
 * CORRECT: Module-level parseStringPromise wrapped in try-catch
 */
async function parseXmlWithErrorHandling(xmlString: string): Promise<object> {
  try {
    const result = await xml2js.parseStringPromise(xmlString);
    return result;
  } catch (error) {
    // Handle malformed XML gracefully
    console.error('Failed to parse XML:', error);
    throw error;
  }
}

/**
 * CORRECT: Named import parseStringPromise wrapped in try-catch
 */
async function parseXmlNamed(xmlString: string): Promise<object> {
  try {
    const result = await parseStringPromise(xmlString);
    return result;
  } catch (err) {
    console.error('XML parse error:', err);
    return {};
  }
}

/**
 * CORRECT: Parser instance parseStringPromise wrapped in try-catch
 */
async function parseXmlWithInstance(xmlString: string): Promise<object> {
  const parser = new Parser({ explicitArray: false });
  try {
    const result = await parser.parseStringPromise(xmlString);
    return result;
  } catch (error) {
    console.error('Parser instance error:', error);
    throw error;
  }
}

/**
 * CORRECT: Using .catch() on the promise chain
 */
async function parseXmlWithCatch(xmlString: string): Promise<object | null> {
  const result = await parseStringPromise(xmlString).catch((err) => {
    console.error('Parse failed:', err);
    return null;
  });
  return result;
}
