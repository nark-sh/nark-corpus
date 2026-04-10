import Handlebars from 'handlebars';

/**
 * Missing error handling for Handlebars.compile().
 * Should trigger ERROR violation — no try-catch.
 */
function compileTemplateMissing(template: string) {
  // ❌ No try-catch — throws on invalid template syntax
  return Handlebars.compile(template);
}

function renderTemplateMissing(template: string, data: Record<string, unknown>) {
  // ❌ No try-catch — throws on invalid template syntax
  const compiled = Handlebars.compile(template);
  return compiled(data);
}
