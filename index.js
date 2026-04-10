const path = require('path');

/**
 * Get the path to the corpus packages directory
 * @returns {string} Absolute path to packages/ directory
 */
function getCorpusPath() {
  return path.join(__dirname, 'packages');
}

/**
 * Get the path to the schema directory
 * @returns {string} Absolute path to schema/ directory
 */
function getSchemaPath() {
  return path.join(__dirname, 'schema');
}

/**
 * Get metadata about the corpus
 * @returns {object} Corpus metadata
 */
function getCorpusInfo() {
  return {
    version: require('./package.json').version,
    packagesPath: getCorpusPath(),
    schemaPath: getSchemaPath(),
  };
}

module.exports = {
  getCorpusPath,
  getSchemaPath,
  getCorpusInfo,
};
