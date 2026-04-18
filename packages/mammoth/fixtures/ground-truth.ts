/**
 * mammoth Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions (from import "mammoth"):
 *   - mammoth.convertToHtml(input)      postcondition: file-read-error, corrupt-docx-error
 *   - mammoth.extractRawText(input)     postcondition: file-read-error, corrupt-docx-error
 *   - mammoth.convertToMarkdown(input)  postcondition: converttomarkdown-file-read-error,
 *                                                      converttomarkdown-corrupt-docx-error,
 *                                                      converttomarkdown-deprecated-use
 *   - mammoth.embedStyleMap(input, sm)  postcondition: embedstylemap-file-read-error,
 *                                                      embedstylemap-corrupt-docx-error,
 *                                                      embedstylemap-result-not-saved
 *
 * Detection path:
 *   - ThrowingFunctionDetector fires convertToHtml/extractRawText/convertToMarkdown/embedStyleMap
 *     without try-catch
 *
 * Source: https://raw.githubusercontent.com/mwilliamson/mammoth.js/master/README.md
 * README shows .catch() as required pattern; unzip.js rejects on invalid input.
 */

import mammoth from "mammoth";

// ─────────────────────────────────────────────────────────────────────────────
// 1. convertToHtml — path input, without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function convertToHtmlPathNoCatch(docxPath: string) {
  // SHOULD_FIRE: file-read-error — mammoth.convertToHtml({path}) without try-catch throws ENOENT if file not found
  const result = await mammoth.convertToHtml({ path: docxPath });
  return result.value;
}

export async function convertToHtmlPathWithCatch(docxPath: string) {
  try {
    // SHOULD_NOT_FIRE: mammoth.convertToHtml inside try-catch satisfies error handling
    const result = await mammoth.convertToHtml({ path: docxPath });
    return result.value;
  } catch (error) {
    console.error("convertToHtml failed:", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. convertToHtml — buffer input, without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function convertToHtmlBufferNoCatch(buffer: Buffer) {
  // SHOULD_FIRE: file-read-error — mammoth.convertToHtml({buffer}) without try-catch throws on corrupt zip
  const result = await mammoth.convertToHtml({ buffer });
  return result.value;
}

export async function convertToHtmlBufferWithCatch(buffer: Buffer) {
  try {
    // SHOULD_NOT_FIRE: mammoth.convertToHtml with buffer inside try-catch satisfies error handling
    const result = await mammoth.convertToHtml({ buffer });
    return result.value;
  } catch (error) {
    console.error("convertToHtml buffer failed:", error);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. extractRawText — path input, without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function extractRawTextPathNoCatch(docxPath: string) {
  // SHOULD_FIRE: file-read-error — mammoth.extractRawText({path}) without try-catch throws ENOENT if file not found
  const result = await mammoth.extractRawText({ path: docxPath });
  return result.value;
}

export async function extractRawTextPathWithCatch(docxPath: string) {
  try {
    // SHOULD_NOT_FIRE: mammoth.extractRawText inside try-catch satisfies error handling
    const result = await mammoth.extractRawText({ path: docxPath });
    return result.value;
  } catch (error) {
    console.error("extractRawText failed:", error);
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. extractRawText — buffer input, without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function extractRawTextBufferNoCatch(buffer: Buffer) {
  // SHOULD_FIRE: file-read-error — mammoth.extractRawText({buffer}) without try-catch throws on corrupt zip
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

export async function extractRawTextBufferWithCatch(buffer: Buffer) {
  try {
    // SHOULD_NOT_FIRE: mammoth.extractRawText with buffer inside try-catch satisfies error handling
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error("extractRawText buffer failed:", error);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. convertToMarkdown — path input, without try-catch
// @expect-violation: converttomarkdown-file-read-error
// @expect-violation: converttomarkdown-corrupt-docx-error
// ─────────────────────────────────────────────────────────────────────────────

export async function convertToMarkdownPathNoCatch(docxPath: string) {
  // SHOULD_FIRE: converttomarkdown-file-read-error — mammoth.convertToMarkdown({path}) without try-catch throws ENOENT if file not found
  const result = await mammoth.convertToMarkdown({ path: docxPath });
  return result.value;
}

// @expect-clean
export async function convertToMarkdownPathWithCatch(docxPath: string) {
  try {
    // SHOULD_NOT_FIRE: mammoth.convertToMarkdown inside try-catch satisfies error handling
    const result = await mammoth.convertToMarkdown({ path: docxPath });
    return result.value;
  } catch (error) {
    console.error("convertToMarkdown failed:", error);
    throw error;
  }
}

// @expect-violation: converttomarkdown-file-read-error
export async function convertToMarkdownBufferNoCatch(buffer: Buffer) {
  // SHOULD_FIRE: converttomarkdown-file-read-error — mammoth.convertToMarkdown({buffer}) without try-catch throws on corrupt zip data
  const result = await mammoth.convertToMarkdown({ buffer });
  return result.value;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. embedStyleMap — path input, without try-catch
// @expect-violation: embedstylemap-file-read-error
// @expect-violation: embedstylemap-corrupt-docx-error
// ─────────────────────────────────────────────────────────────────────────────

export async function embedStyleMapNoCatch(docxPath: string, styleMap: string) {
  // SHOULD_FIRE: embedstylemap-file-read-error — mammoth.embedStyleMap({path}) without try-catch throws ENOENT if file not found
  const result = await mammoth.embedStyleMap({ path: docxPath }, styleMap);
  return result.toBuffer();
}

// @expect-clean
export async function embedStyleMapWithCatch(docxPath: string, styleMap: string) {
  try {
    // SHOULD_NOT_FIRE: mammoth.embedStyleMap inside try-catch satisfies error handling
    const result = await mammoth.embedStyleMap({ path: docxPath }, styleMap);
    return result.toBuffer();
  } catch (error) {
    console.error("embedStyleMap failed:", error);
    throw error;
  }
}

// @expect-violation: embedstylemap-file-read-error
export async function embedStyleMapBufferNoCatch(buffer: Buffer, styleMap: string) {
  // SHOULD_FIRE: embedstylemap-file-read-error — mammoth.embedStyleMap({buffer}) without try-catch throws on corrupt zip data
  const result = await mammoth.embedStyleMap({ buffer }, styleMap);
  return result.toArrayBuffer();
}
