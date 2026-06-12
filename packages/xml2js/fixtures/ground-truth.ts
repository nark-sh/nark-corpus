/**
 * Ground truth fixture for xml2js
 * Annotated with SHOULD_FIRE / SHOULD_NOT_FIRE for scanner validation.
 *
 * Postcondition IDs from contract.yaml:
 *   parse-error-malformed-xml
 *   parse-promise-null-return
 *   parse-string-callback-error-ignored
 *   parse-string-no-callback
 *   build-object-invalid-root-name
 *   build-object-invalid-xml-chars
 *   parser-instance-malformed-xml
 *   parser-instance-parse-string-callback-error-ignored  (added 2026-06-12 deepen pass 2)
 *   parser-instance-parse-string-no-callback             (added 2026-06-12 deepen pass 2)
 *
 * Annotation comments must be immediately above the call site (the await line).
 */

import xml2js from 'xml2js';
import { parseStringPromise, parseString, Parser } from 'xml2js';

async function parseXmlProtected(xml: string) {
  try {
    // SHOULD_NOT_FIRE: module-level call wrapped in try-catch
    const result = await xml2js.parseStringPromise(xml);
    return result;
  } catch (err) {
    console.error(err);
    throw err;
  }
}

async function parseXmlNamedProtected(xml: string) {
  try {
    // SHOULD_NOT_FIRE: named import call wrapped in try-catch
    const result = await parseStringPromise(xml);
    return result;
  } catch (err) {
    throw err;
  }
}

async function parseXmlInstanceProtected(xml: string) {
  const parser = new Parser({ explicitArray: false });
  try {
    // SHOULD_NOT_FIRE: instance method wrapped in try-catch
    return await parser.parseStringPromise(xml);
  } catch (err) {
    return null;
  }
}

async function parseXmlUnprotected(xml: string) {
  // SHOULD_FIRE: parse-error-malformed-xml — module-level call without try-catch
  const result = await xml2js.parseStringPromise(xml);
  return result;
}

async function parseXmlNamedUnprotected(xml: string) {
  // SHOULD_FIRE: parse-error-malformed-xml — named import call without try-catch
  const result = await parseStringPromise(xml);
  return result;
}

async function parseXmlInstanceUnprotected(xml: string) {
  const parser = new Parser();
  // SHOULD_FIRE: parser-instance-malformed-xml — instance method without try-catch
  const result = await parser.parseStringPromise(xml);
  return result;
}

async function getUsersFromApi(data: string) {
  // SHOULD_FIRE: parse-error-malformed-xml — real-world pattern from sct/overseerr getUsers()
  const parsedXml = (await xml2js.parseStringPromise(
    data
  )) as Record<string, unknown>;
  return parsedXml;
}

// ─── parseString (callback-based) ─────────────────────────────────────────────

function parseStringCallbackClean(xml: string) {
  // SHOULD_NOT_FIRE: checks err before using result
  parseString(xml, (err, result) => {
    if (err) {
      console.error('parse error:', err.message);
      return;
    }
    console.log(result);
  });
}

function parseStringCallbackIgnoresError(xml: string) {
  // SHOULD_FIRE: parse-string-callback-error-ignored — err not checked before using result
  parseString(xml, (err, result) => {
    console.log(result.items);
  });
}

function parseStringCallbackNoCheck(xml: string) {
  // SHOULD_FIRE: parse-string-callback-error-ignored — callback receives err but ignores it
  xml2js.parseString(xml, function(err: Error | null, result: any) {
    const items = result.items;
    return items;
  });
}

// ─── Builder.buildObject ──────────────────────────────────────────────────────

function buildObjectClean(data: Record<string, unknown>): string {
  // SHOULD_NOT_FIRE: wrapped in try-catch
  const builder = new xml2js.Builder();
  try {
    return builder.buildObject(data);
  } catch (err) {
    console.error('XML build failed:', err);
    throw err;
  }
}

function buildObjectNoTryCatch(data: Record<string, unknown>): string {
  const builder = new xml2js.Builder();
  // SHOULD_FIRE: build-object-invalid-root-name — buildObject can throw, no try-catch
  return builder.buildObject(data);
}

function buildObjectFromDynamicData(userInput: Record<string, unknown>): string {
  const builder = new xml2js.Builder({ rootName: 'response' });
  // SHOULD_FIRE: build-object-invalid-root-name — buildObject can throw on user data, no try-catch
  return builder.buildObject(userInput);
}

// ─── Parser instance parseStringPromise ─────────────────────────────────────

async function parserInstanceClean(xml: string) {
  // SHOULD_NOT_FIRE: parser instance wrapped in try-catch
  const parser = new Parser({ explicitArray: false, trim: true });
  try {
    const result = await parser.parseStringPromise(xml);
    return result;
  } catch (err) {
    console.error('Parser instance error:', err);
    return null;
  }
}

async function parserInstanceNoErrorHandling(xml: string) {
  const parser = new Parser({ explicitArray: false });
  // SHOULD_FIRE: parser-instance-malformed-xml — Parser instance without try-catch
  const result = await parser.parseStringPromise(xml);
  return result;
}

// ─── parsePromise null return on empty string ─────────────────────────────────

async function parseEmptyStringClean(xml: string) {
  // SHOULD_NOT_FIRE: null-checks the result before accessing properties
  const result = await parseStringPromise(xml);
  if (result == null) {
    return null;
  }
  return result.root;
}

async function parseEmptyStringNoNullCheck(xml: string) {
  // SHOULD_FIRE: parse-promise-null-return — result not null-checked, crashes on empty input
  const result = await parseStringPromise(xml);
  return result.root.items;
}

// ─── Parser instance parseString (callback) — added 2026-06-12 deepen pass 2 ──

function parserInstanceCallbackClean(xml: string) {
  // SHOULD_NOT_FIRE: instance callback checks err before using result
  const parser = new Parser({ explicitArray: false });
  parser.parseString(xml, (err, result) => {
    if (err) {
      console.error('instance parse error:', err.message);
      return;
    }
    console.log(result);
  });
}

function parserInstanceCallbackIgnoresError(xml: string) {
  const parser = new Parser({ explicitArray: false });
  // SHOULD_FIRE: parser-instance-parse-string-callback-error-ignored — err discarded
  parser.parseString(xml, (err, result) => {
    console.log(result.items);
  });
}

function parserInstanceCallbackUntypedIgnoresError(xml: string) {
  const parser = new Parser();
  // SHOULD_FIRE: parser-instance-parse-string-callback-error-ignored — function-expr callback ignores err
  parser.parseString(xml, function(err: Error | null, result: any) {
    const items = result.items;
    return items;
  });
}

function parserInstanceParseStringNoCallback(xml: string) {
  const parser = new Parser({ explicitArray: false });
  // SHOULD_FIRE: parser-instance-parse-string-no-callback — instance parseString called without cb
  parser.parseString(xml);
}
