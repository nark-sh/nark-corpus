import mammoth from "mammoth";

/**
 * Missing error handling for mammoth.convertToHtml with path.
 * Should trigger ERROR violation — no try-catch.
 */
async function convertDocxToHtmlMissingCatch(docxPath: string): Promise<string> {
  // ❌ No try-catch — will throw if file not found or corrupt
  const result = await mammoth.convertToHtml({ path: docxPath });
  return result.value;
}

/**
 * Missing error handling for mammoth.convertToHtml with buffer.
 * Should trigger ERROR violation — no try-catch.
 */
async function convertDocxBufferMissingCatch(buffer: Buffer): Promise<string> {
  // ❌ No try-catch — will throw if buffer is corrupt/invalid zip
  const result = await mammoth.convertToHtml({ buffer });
  return result.value;
}

/**
 * Missing error handling for mammoth.extractRawText.
 * Should trigger ERROR violation — no try-catch.
 */
async function extractRawTextMissingCatch(docxPath: string): Promise<string> {
  // ❌ No try-catch — will throw if file not found
  const result = await mammoth.extractRawText({ path: docxPath });
  return result.value;
}

/**
 * Missing error handling for mammoth.extractRawText with buffer.
 * Should trigger ERROR violation — no try-catch.
 */
async function extractRawTextBufferMissingCatch(buffer: Buffer): Promise<string> {
  // ❌ No try-catch — will throw on corrupt buffer
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}
