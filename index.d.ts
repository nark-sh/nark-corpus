/**
 * Get the path to the corpus packages directory
 * @returns Absolute path to packages/ directory
 */
export function getCorpusPath(): string;

/**
 * Get the path to the schema directory
 * @returns Absolute path to schema/ directory
 */
export function getSchemaPath(): string;

/**
 * Get metadata about the corpus
 * @returns Corpus metadata
 */
export function getCorpusInfo(): {
  version: string;
  packagesPath: string;
  schemaPath: string;
};
