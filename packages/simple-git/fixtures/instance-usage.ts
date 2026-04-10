/**
 * Instance-based usage patterns for simple-git.
 * Tests detection via class instances where git is stored on `this`.
 * Should trigger violations for unprotected instance method calls.
 */
import simpleGit, { SimpleGit } from 'simple-git';

// Pattern: class-based wrapper — similar to amplication's git-cli.ts
class GitCli {
  private git: SimpleGit;

  constructor(repositoryDir: string) {
    this.git = simpleGit({
      config: [`safe.directory=${repositoryDir}`],
    });
  }

  // ❌ push without try-catch — should trigger violation
  async push(options?: string[]) {
    return this.git.push(options);
  }

  // ❌ pull without try-catch — should trigger violation
  async pull(remote: string, branch: string) {
    return this.git.pull(remote, branch);
  }

  // ✅ Proper: checkout with try-catch — should NOT trigger violation
  async checkout(branch: string): Promise<void> {
    try {
      await this.git.checkout(branch);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to checkout branch: ${errorMessage}`);
    }
  }
}

export { GitCli };
