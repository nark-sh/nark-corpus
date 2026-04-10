/**
 * handlebars Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions:
 *   - Handlebars.compile(template)    postcondition: invalid-template-syntax
 *
 * Detection path:
 *   - ThrowingFunctionDetector fires compile() without try-catch
 *
 * Source: handlebars 4.7.9 lib/handlebars/compiler/compiler.js
 * compile() throws Handlebars.Exception on invalid template syntax.
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
