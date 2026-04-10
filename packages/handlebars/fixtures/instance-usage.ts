import Handlebars from 'handlebars';

/**
 * Instance-style usage of Handlebars.compile().
 * Tests detection when compile() is called via a class method.
 */
class TemplateEngine {
  // ❌ No try-catch — should trigger violation
  compile(template: string) {
    return Handlebars.compile(template);
  }

  // ✅ Wrapped in try-catch — should NOT trigger violation
  safeCompile(template: string) {
    try {
      return Handlebars.compile(template);
    } catch (error) {
      console.error('Template compilation failed:', error);
      return null;
    }
  }
}

const engine = new TemplateEngine();
