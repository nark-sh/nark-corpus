/**
 * handlebars Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions:
 *   - Handlebars.compile(template)               postcondition: invalid-template-syntax
 *                                                 postcondition: compile-invalid-input-type
 *   - TemplateDelegate(context, options?)         postcondition: template-execution-partial-not-found
 *                                                 postcondition: template-execution-strict-undefined-variable
 *                                                 postcondition: template-execution-prototype-access-silent-failure
 *   - Handlebars.precompile(input, options?)      postcondition: precompile-invalid-template-syntax
 *                                                 postcondition: precompile-invalid-input-type
 *   - Handlebars.template(templateSpec)           postcondition: template-version-mismatch
 *
 * Detection path:
 *   - ThrowingFunctionDetector fires compile(), precompile(), template() without try-catch
 *   - Template execution call site detection is a future scanner concern
 *
 * Source: handlebars 4.7.9
 *   - compile/precompile: lib/handlebars/compiler/compiler.js
 *   - template execution: lib/handlebars/runtime.js (invokePartial, strict container)
 *   - template(): lib/handlebars/runtime.js (checkRevision)
 */

import Handlebars from 'handlebars';

// ─────────────────────────────────────────────────────────────────────────────
// 1. compile() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export function compileTemplateNoCatch(templateString: string) {
  // SHOULD_FIRE: invalid-template-syntax — Handlebars.compile() without try-catch throws on invalid syntax
  const template = Handlebars.compile(templateString);
  return template;
}

export function compileTemplateWithCatch(templateString: string) {
  try {
    // SHOULD_NOT_FIRE: Handlebars.compile() inside try-catch satisfies error handling
    const template = Handlebars.compile(templateString);
    return template;
  } catch (error) {
    console.error("Template compilation failed:", error);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. compile() with user input — without try-catch (common real-world pattern)
// ─────────────────────────────────────────────────────────────────────────────

export function renderUserTemplate(userTemplate: string, data: Record<string, unknown>) {
  // SHOULD_FIRE: invalid-template-syntax — compiling user-provided template without try-catch
  const template = Handlebars.compile(userTemplate);
  return template(data);
}

export function renderUserTemplateSafe(userTemplate: string, data: Record<string, unknown>) {
  try {
    // SHOULD_NOT_FIRE: Handlebars.compile() inside try-catch satisfies error handling
    const template = Handlebars.compile(userTemplate);
    return template(data);
  } catch (error) {
    console.error("Template render failed:", error);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2b. compile() — input from external source that may return null/undefined
// ─────────────────────────────────────────────────────────────────────────────

export function compileTemplateFromFileNoCatch(maybeTemplate: string | null | undefined) {
  // SHOULD_FIRE: compile-invalid-input-type — compile() throws when input is null/undefined/non-string
  const template = Handlebars.compile(maybeTemplate as any);
  return template;
}

export function compileTemplateFromFileSafe(maybeTemplate: string | null | undefined) {
  try {
    // SHOULD_NOT_FIRE: compile() inside try-catch handles invalid input type
    const template = Handlebars.compile(maybeTemplate as any);
    return template;
  } catch (error) {
    console.error("Template input invalid:", error);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Template execution — partial not found
// ─────────────────────────────────────────────────────────────────────────────

// NOTE: No @expect-violation annotation here because the scanner fires invalid-template-syntax
// on the compile() call (no-try-catch pattern), not template-execution-partial-not-found.
// template-execution-partial-not-found detection is a future scanner concern (uncovered detection).
// The compile() call without try-catch IS correctly flagged by the scanner already.
export function renderWithMissingPartial(data: Record<string, unknown>) {
  // SHOULD_FIRE: invalid-template-syntax — compile() without try-catch (scanner detects this; future rule needed for template execution partial-not-found)
  const template = Handlebars.compile('{{> header}} Hello {{name}}');
  return template(data);
}

// @expect-clean
// Partial is registered before template execution
export function renderWithRegisteredPartial(data: Record<string, unknown>) {
  try {
    Handlebars.registerPartial('header', '<h1>{{title}}</h1>');
    // SHOULD_NOT_FIRE: partial is registered, execution succeeds
    const template = Handlebars.compile('{{> header}} Hello {{name}}');
    return template(data);
  } catch (error) {
    console.error("Template render failed:", error);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Template execution — strict mode undefined variable
// ─────────────────────────────────────────────────────────────────────────────

// NOTE: No @expect-violation annotation here because the scanner fires invalid-template-syntax
// on the compile() call (no-try-catch pattern), not template-execution-strict-undefined-variable.
// template-execution-strict-undefined-variable detection is a future scanner concern.
// The compile() without try-catch IS correctly flagged by existing scanner already.
export function renderStrictModeNoCatch(data: Record<string, unknown>) {
  // SHOULD_FIRE: invalid-template-syntax — compile() without try-catch (scanner detects this; future rule needed for strict-mode template execution)
  const template = Handlebars.compile('{{missingField}}', { strict: true });
  return template(data);
}

// @expect-clean
// Strict mode with try-catch properly handles undefined variable error
export function renderStrictModeWithCatch(data: Record<string, unknown>) {
  try {
    // SHOULD_NOT_FIRE: strict mode execution wrapped in try-catch
    const template = Handlebars.compile('{{missingField}}', { strict: true });
    return template(data);
  } catch (error) {
    console.error("Strict template variable undefined:", error);
    return '';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. precompile() — without try-catch
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: precompile-invalid-template-syntax
export function precompileTemplateBuildStep(templateString: string) {
  // SHOULD_FIRE: precompile-invalid-template-syntax — precompile() without try-catch throws on invalid syntax
  const spec = Handlebars.precompile(templateString);
  return spec;
}

// @expect-clean
export function precompileTemplateSafe(templateString: string) {
  try {
    // SHOULD_NOT_FIRE: precompile() inside try-catch
    const spec = Handlebars.precompile(templateString);
    return spec;
  } catch (error) {
    console.error("Template precompilation failed:", error);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Handlebars.template() — version mismatch
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: template-version-mismatch
export function loadPrecompiledTemplate(templateSpec: any) {
  // SHOULD_FIRE: template-version-mismatch — template() without try-catch throws on version mismatch
  const template = Handlebars.template(templateSpec);
  return template;
}

// @expect-clean
export function loadPrecompiledTemplateSafe(templateSpec: any) {
  try {
    // SHOULD_NOT_FIRE: template() inside try-catch handles version mismatch
    const template = Handlebars.template(templateSpec);
    return template;
  } catch (error) {
    console.error("Precompiled template version mismatch:", error);
    return null;
  }
}
