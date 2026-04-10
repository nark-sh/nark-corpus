/**
 * Instance-based detection for replicate.
 * Tests that violations are detected when client is stored in variables/fields.
 * Some calls have error handling (SHOULD_NOT_FIRE), some don't (SHOULD_FIRE).
 */
import Replicate from 'replicate';

// Instance stored in module variable
const client = new Replicate({ auth: process.env.REPLICATE_API_TOKEN! });

// Missing try-catch on instance variable — should fire
async function runFromModuleClient(prompt: string) {
  const output = await client.run("owner/model", { input: { prompt } });
  return output;
}

// With try-catch on instance variable — should not fire
async function runFromModuleClientSafe(prompt: string) {
  try {
    const output = await client.run("owner/model", { input: { prompt } });
    return output;
  } catch (error) {
    throw error;
  }
}

// Instance created inside function, missing try-catch — should fire
async function runInlineInstanceMissing(prompt: string) {
  const r = new Replicate({ auth: 'test' });
  const output = await r.run("owner/model", { input: { prompt } });
  return output;
}

// Class-based instance — missing try-catch — should fire
class ImageGenerator {
  private replicate: Replicate;

  constructor(token: string) {
    this.replicate = new Replicate({ auth: token });
  }

  async generate(prompt: string) {
    const output = await this.replicate.run("stability-ai/sdxl", {
      input: { prompt }
    });
    return output;
  }
}

// Class-based instance — with try-catch — should not fire
class SafeImageGenerator {
  private replicate: Replicate;

  constructor(token: string) {
    this.replicate = new Replicate({ auth: token });
  }

  async generate(prompt: string) {
    try {
      const output = await this.replicate.run("stability-ai/sdxl", {
        input: { prompt }
      });
      return output;
    } catch (error) {
      console.error('Generation error:', error);
      throw error;
    }
  }
}
