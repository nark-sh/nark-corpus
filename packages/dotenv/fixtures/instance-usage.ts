/**
 * Instance Usage for dotenv
 * Tests detection via function calls
 */

import * as dotenv from 'dotenv';
import { config, parse } from 'dotenv';

class ConfigManager {
  constructor() {
    // ❌ No error checking
    dotenv.config();
  }
  
  loadConfig(path: string) {
    // ❌ No error checking
    const result = dotenv.config({ path });
    return result.parsed;
  }
  
  parseContent(content: string) {
    // ❌ No try-catch
    return dotenv.parse(content);
  }
}

class EnvironmentLoader {
  private loaded = false;
  
  load() {
    // ❌ No error checking
    config();
    this.loaded = true;
  }
  
  parseBuffer(buffer: Buffer) {
    // ❌ No try-catch
    return parse(buffer);
  }
}

// ❌ Module-level config without error handling
config();

// ❌ Direct parse without error handling
const envContent = 'KEY=value\nINVALID';
parse(envContent);

export { ConfigManager, EnvironmentLoader };
