/**
 * Fixtures: missing error handling for xml2js
 * These patterns should produce ERROR violations.
 */

import xml2js from 'xml2js';
import { parseStringPromise, Parser } from 'xml2js';

/**
 * WRONG: Module-level parseStringPromise without try-catch
 * Should trigger ERROR violation.
 */
async function parseXmlNoErrorHandling(xmlString: string): Promise<object> {
  // ❌ No try-catch — parseStringPromise rejects on malformed XML
  const result = await xml2js.parseStringPromise(xmlString);
  return result;
}

/**
 * WRONG: Named import parseStringPromise without try-catch
 * Should trigger ERROR violation.
 */
async function parseXmlNamedNoHandler(xmlString: string): Promise<object> {
  // ❌ No try-catch — rejects on malformed XML
  const result = await parseStringPromise(xmlString);
  return result;
}

/**
 * WRONG: Parser instance without try-catch
 * Should trigger ERROR violation.
 */
async function parseXmlInstanceNoHandler(xmlString: string): Promise<object> {
  const parser = new Parser({ explicitArray: false });
  // ❌ No try-catch on instance method
  const result = await parser.parseStringPromise(xmlString);
  return result;
}

/**
 * WRONG: Intermediate variable, no try-catch
 * Should trigger ERROR violation.
 */
async function getUsersFromXml(data: string) {
  const parsedXml = (await xml2js.parseStringPromise(
    data
  )) as Record<string, unknown>;
  return parsedXml;
}
