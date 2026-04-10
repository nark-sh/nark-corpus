import mammoth from "mammoth";
import * as fs from "fs";

/**
 * Proper error handling for mammoth.convertToHtml with path input.
 * Should NOT trigger violations.
 */
async function convertDocxToHtmlWithPath(docxPath: string): Promise<string> {
  try {
    const result = await mammoth.convertToHtml({ path: docxPath });
    return result.value;
  } catch (error) {
    console.error("Failed to convert docx:", error);
    throw error;
  }
}

/**
 * Proper error handling for mammoth.convertToHtml with buffer input.
 * Should NOT trigger violations.
 */
async function convertDocxToHtmlWithBuffer(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.convertToHtml({ buffer });
    return result.value;
  } catch (error) {
    console.error("Failed to convert docx buffer:", error);
    throw error;
  }
}

/**
 * Proper error handling for mammoth.extractRawText.
 * Should NOT trigger violations.
 */
async function extractTextFromDocxWithPath(docxPath: string): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ path: docxPath });
    return result.value;
  } catch (error) {
    console.error("Failed to extract text:", error);
    throw error;
  }
}

/**
 * Proper error handling for mammoth.extractRawText with buffer.
 * Should NOT trigger violations.
 */
async function extractTextFromBuffer(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error("Failed to extract text from buffer:", error);
    throw error;
  }
}
