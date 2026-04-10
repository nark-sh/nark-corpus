# Sources — simple-git

All URLs fetched on 2026-04-02.

## Official Documentation

- https://raw.githubusercontent.com/steveukx/git-js/refs/heads/main/simple-git/readme.md
  - Error handling patterns: GitError and GitResponseError, try-catch examples
  - Merged the summary: "task will reject with a GitError... or a GitResponseError"

- https://github.com/steveukx/git-js/blob/main/simple-git/typings/simple-git.d.ts
  - TypeScript definitions for SimpleGit interface, all async methods
  - Error type imports from './errors'

## Security

- https://www.codeant.ai/security-research/simple-git-remote-code-execution-cve-2026-28292
  - CVE-2026-28292 (CVSS 9.8): RCE via protocol.allow case-sensitivity bypass
  - Affected: 3.15.0-3.32.2 | Fixed: 3.32.3

## Real-World Evidence

- activepieces/activepieces: packages/server/api/src/app/ee/projects/project-release/git-sync/git-sync-handler.ts
  - git.push() called without try-catch (TRUE POSITIVE)
- amplication/amplication: libs/util/git/src/providers/git-cli.ts
  - push() wrapper without error handling
- cline/cline: src/core/controller/worktree/checkoutBranch.ts
  - Correct try-catch pattern (reference implementation)
- QwenLM/qwen-code: packages/core/src/services/gitService.ts
  - Mixed: createFileSnapshot has try-catch, restoreProjectFromSnapshot does not
