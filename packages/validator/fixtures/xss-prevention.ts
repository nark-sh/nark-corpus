import validator from 'validator';

/**
 * XSS Prevention Patterns for validator.escape()
 */

/**
 * PROPER: Escape user input before rendering in HTML
 * Should NOT trigger violation.
 */
function renderCommentSafe(comment: string): string {
  const safeComment = validator.escape(comment);
  return `<div class="comment">${safeComment}</div>`;
}

/**
 * PROPER: Escape multiple user inputs
 * Should NOT trigger violation.
 */
function renderUserProfileSafe(name: string, bio: string): string {
  const safeName = validator.escape(name);
  const safeBio = validator.escape(bio);
  return `
    <div class="profile">
      <h2>${safeName}</h2>
      <p>${safeBio}</p>
    </div>
  `;
}

/**
 * PROPER: Escape input in HTML attributes
 * Should NOT trigger violation.
 */
function renderLinkSafe(title: string, url: string): string {
  const safeTitle = validator.escape(title);
  // Note: URL should also be validated separately
  if (!validator.isURL(url, { protocols: ['https'], require_protocol: true })) {
    throw new Error('Invalid URL');
  }
  return `<a href="${url}" title="${safeTitle}">Link</a>`;
}

/**
 * MISSING: User input in HTML without escape
 * Should trigger ERROR violation.
 */
function renderCommentUnsafe(comment: string): string {
  // ❌ XSS vulnerability
  return `<div class="comment">${comment}</div>`;
}

/**
 * MISSING: User input in HTML attribute without escape
 * Should trigger ERROR violation.
 */
function renderImageUnsafe(altText: string): string {
  // ❌ XSS via alt attribute
  return `<img src="photo.jpg" alt="${altText}">`;
}

/**
 * PROPER: Escape in template literal
 * Should NOT trigger violation.
 */
function buildHTMLEmailSafe(userName: string, message: string): string {
  const safeName = validator.escape(userName);
  const safeMessage = validator.escape(message);

  return `
    <!DOCTYPE html>
    <html>
      <body>
        <h1>Hello, ${safeName}!</h1>
        <p>${safeMessage}</p>
      </body>
    </html>
  `;
}

/**
 * EDGE CASE: escape() on already-escaped content (double escaping)
 * This is SAFE but may cause display issues.
 * Should NOT trigger violation (defensive programming).
 */
function doubleEscape(input: string): string {
  const escaped1 = validator.escape(input);
  const escaped2 = validator.escape(escaped1); // Double escaping
  return `<p>${escaped2}</p>`; // Will show &amp;lt; instead of <
}

/**
 * PROPER: Escape before concatenation
 * Should NOT trigger violation.
 */
function buildDynamicHTMLSafe(items: string[]): string {
  const safeItems = items.map(item => validator.escape(item));
  return `<ul>${safeItems.map(item => `<li>${item}</li>`).join('')}</ul>`;
}

/**
 * MISSING: Concatenation without escaping
 * Should trigger ERROR violation.
 */
function buildDynamicHTMLUnsafe(items: string[]): string {
  // ❌ XSS vulnerability - items not escaped
  return `<ul>${items.map(item => `<li>${item}</li>`).join('')}</ul>`;
}
