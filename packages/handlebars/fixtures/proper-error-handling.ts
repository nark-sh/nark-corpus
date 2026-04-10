import Handlebars from 'handlebars';

/**
 * Proper error handling for Handlebars.compile().
 * Should NOT trigger violations.
 */
function compileTemplateSafe(template: string) {
  try {
    return Handlebars.compile(template);
  } catch (error) {
    console.error("Template compilation failed:", error);
    throw error;
  }
}

function renderTemplateSafe(template: string, data: Record<string, unknown>) {
  try {
    const compiled = Handlebars.compile(template);
    return compiled(data);
  } catch (error) {
    console.error("Template render failed:", error);
    return '';
  }
}
