/**
 * Fixtures: instance-based xml2js usage
 * Tests that the scanner detects Parser instance calls correctly.
 */

import xml2js from 'xml2js';
import { Parser } from 'xml2js';

class XmlParserService {
  private parser: xml2js.Parser;

  constructor() {
    this.parser = new xml2js.Parser({ explicitArray: false });
  }

  /**
   * WRONG: Instance method call without try-catch
   * Should trigger ERROR violation.
   */
  async parseResponse(xmlData: string) {
    // ❌ No try-catch — rejects on malformed XML
    const result = await this.parser.parseStringPromise(xmlData);
    return result;
  }

  /**
   * CORRECT: Protected instance call
   * Should NOT trigger violation.
   */
  async parseResponseSafe(xmlData: string) {
    try {
      const result = await this.parser.parseStringPromise(xmlData);
      return result;
    } catch (error) {
      console.error('Failed to parse XML response:', error);
      return null;
    }
  }
}

/**
 * WRONG: Standalone Parser instance without protection
 */
async function parseXmlStandalone(xml: string) {
  const p = new Parser();
  // ❌ No try-catch
  const data = await p.parseStringPromise(xml);
  return data;
}
