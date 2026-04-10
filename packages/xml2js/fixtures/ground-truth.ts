/**
 * Ground truth fixture for xml2js
 * Annotated with SHOULD_FIRE / SHOULD_NOT_FIRE for scanner validation.
 *
 * Postcondition IDs from contract.yaml:
 *   parse-error-malformed-xml
 *
 * Annotation comments must be immediately above the call site (the await line).
 */

import xml2js from 'xml2js';
import { parseStringPromise, Parser } from 'xml2js';

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
  // SHOULD_FIRE: parse-error-malformed-xml — instance method without try-catch
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
