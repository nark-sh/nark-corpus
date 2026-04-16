/**
 * express-validator Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the express-validator contract spec, NOT V1 behavior.
 *
 * Key contract rules:
 *   - body(), check(), query(), param(), cookie(), header() all produce
 *     validation chains whose errors MUST be checked via validationResult()
 *   - checkSchema() follows the same pattern at schema level
 *   - oneOf() errors are nested — validationResult must be checked
 *   - checkExact() detects unknown fields — must check validationResult
 *   - ValidationChain.run() must be awaited; result must be checked
 *   - Result.throw() requires try-catch in Express 4 without async error handling
 */

import { Request, Response, NextFunction } from 'express';
import {
  body,
  check,
  cookie,
  header,
  query,
  param,
  checkSchema,
  checkExact,
  oneOf,
  validationResult,
  matchedData,
} from 'express-validator';

// ─────────────────────────────────────────────────────────────────────────────
// 1. body() — missing validationResult check
// ─────────────────────────────────────────────────────────────────────────────

// SHOULD_FIRE: validation-errors-silent — body() runs but validationResult never checked
export async function handleUserCreateMissingCheck(req: Request, res: Response) {
  await body('email').isEmail().run(req);
  await body('name').notEmpty().run(req);
  // No validationResult check — invalid email/name silently passes through
  const { email, name } = req.body;
  res.json({ email, name });
}

// SHOULD_NOT_FIRE: validationResult called and isEmpty() checked
export async function handleUserCreateWithCheck(req: Request, res: Response) {
  await body('email').isEmail().run(req);
  await body('name').notEmpty().run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { email, name } = req.body;
  res.json({ email, name });
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. cookie() — missing validationResult check
// ─────────────────────────────────────────────────────────────────────────────

// SHOULD_FIRE: cookie-validation-errors-silent — cookie chain runs, no validationResult check
export async function handleCookieAuthMissingCheck(req: Request, res: Response) {
  await cookie('session_id').isUUID().run(req);
  // No validationResult check — invalid session cookie silently passes
  const sessionId = req.cookies.session_id;
  res.json({ sessionId });
}

// SHOULD_NOT_FIRE: validationResult called after cookie validation
export async function handleCookieAuthWithCheck(req: Request, res: Response) {
  await cookie('session_id').isUUID().run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(401).json({ errors: errors.array() });
  }
  const sessionId = req.cookies.session_id;
  res.json({ sessionId });
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. header() — missing validationResult check
// ─────────────────────────────────────────────────────────────────────────────

// SHOULD_FIRE: header-validation-errors-silent — header chain runs, no validationResult check
export async function handleApiKeyMissingCheck(req: Request, res: Response) {
  await header('x-api-key').notEmpty().isLength({ min: 32 }).run(req);
  // No validationResult check — missing/short API key silently passes through
  const apiKey = req.headers['x-api-key'];
  res.json({ authorized: true });
}

// SHOULD_NOT_FIRE: validationResult called after header validation
export async function handleApiKeyWithCheck(req: Request, res: Response) {
  await header('x-api-key').notEmpty().isLength({ min: 32 }).run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(401).json({ errors: errors.array() });
  }
  res.json({ authorized: true });
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. checkSchema() — missing validationResult check
// ─────────────────────────────────────────────────────────────────────────────

const userSchema = checkSchema({
  email: { isEmail: true, in: ['body'] },
  name: { notEmpty: true, in: ['body'] },
  age: { isInt: { options: { min: 18 } }, in: ['body'] },
});

// SHOULD_FIRE: checkschema-validation-errors-silent — schema runs but no validationResult check
export async function handleSchemaValidationMissingCheck(req: Request, res: Response) {
  await Promise.all(userSchema.map(chain => chain.run(req)));
  // No validationResult check — all field errors silently ignored
  const data = req.body;
  res.json(data);
}

// SHOULD_NOT_FIRE: checkSchema used as middleware with proper validationResult check
export const handleSchemaValidationProper = [
  ...userSchema,
  (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const data = matchedData(req);
    return res.json(data);
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 5. oneOf() — missing validationResult check
// ─────────────────────────────────────────────────────────────────────────────

// SHOULD_FIRE: oneof-all-chains-failed-error-not-checked — oneOf runs but no validationResult
export async function handleAuthMethodMissingCheck(req: Request, res: Response) {
  await oneOf([
    body('email').isEmail(),
    body('username').isAlphanumeric(),
  ]).run(req);
  // No validationResult check — missing auth field silently passes
  res.json({ ok: true });
}

// SHOULD_NOT_FIRE: validationResult called after oneOf
export async function handleAuthMethodWithCheck(req: Request, res: Response) {
  await oneOf([
    body('email').isEmail(),
    body('username').isAlphanumeric(),
  ]).run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  res.json({ ok: true });
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. checkExact() — missing validationResult check
// ─────────────────────────────────────────────────────────────────────────────

// SHOULD_FIRE: checkexact-unknown-fields-not-checked — checkExact runs but no validationResult
export async function handleExactFieldsMissingCheck(req: Request, res: Response) {
  const chains = [body('name').notEmpty(), body('email').isEmail()];
  await Promise.all(chains.map(c => c.run(req)));
  await checkExact(chains).run(req);
  // No validationResult check — unknown fields (e.g., __proto__, isAdmin) pass silently
  res.json(req.body);
}

// SHOULD_NOT_FIRE: checkExact with proper validationResult check
export async function handleExactFieldsWithCheck(req: Request, res: Response) {
  const nameChain = body('name').notEmpty();
  const emailChain = body('email').isEmail();
  await nameChain.run(req);
  await emailChain.run(req);
  await checkExact([nameChain, emailChain]).run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  res.json(matchedData(req));
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. run() — not awaited (fire-and-forget)
// ─────────────────────────────────────────────────────────────────────────────

// SHOULD_FIRE: run-not-awaited — run() called without await, validation never completes
export function handleRunNotAwaited(req: Request, res: Response) {
  // Missing await — validation starts but handler continues before it finishes
  body('email').isEmail().run(req);
  const errors = validationResult(req);
  // errors will always be empty because run() hasn't completed
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  res.json({ email: req.body.email });
}

// SHOULD_NOT_FIRE: run() properly awaited
export async function handleRunAwaited(req: Request, res: Response) {
  await body('email').isEmail().run(req);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  res.json({ email: req.body.email });
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. result-throw — no try-catch (Express 4 without async-errors)
// ─────────────────────────────────────────────────────────────────────────────

// SHOULD_FIRE: result-throw-no-trycatch — .throw() called without try-catch in Express 4
// route — validation errors become 500 instead of 400
export async function handleWithThrowNoCatch(req: Request, res: Response) {
  await body('email').isEmail().run(req);
  // If validation fails, this throws an unhandled exception → 500 Internal Server Error
  validationResult(req).throw();
  res.json({ email: req.body.email });
}

// SHOULD_NOT_FIRE: .throw() inside try-catch, structured 400 response returned
export async function handleWithThrowAndCatch(req: Request, res: Response, next: NextFunction) {
  try {
    await body('email').isEmail().run(req);
    validationResult(req).throw();
    res.json({ email: req.body.email });
  } catch (err: any) {
    if (err.array) {
      // err is a Result-decorated error
      return res.status(400).json({ errors: err.array() });
    }
    next(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. validationResult.withDefaults — formatter error propagation
// ─────────────────────────────────────────────────────────────────────────────

// @expect-violation: withdefaults-formatter-throws
// SHOULD_FIRE: formatter throws on AlternativeValidationError (no .path property)
const badFormatterResult = validationResult.withDefaults({
  formatter: (error) => {
    // Destructures .path — throws on AlternativeValidationError which has no path
    return { field: (error as any).path.toUpperCase(), msg: error.msg };
  },
});
export async function handleWithBadFormatter(req: Request, res: Response) {
  await oneOf([body('email').isEmail(), body('phone').isMobilePhone('any')]).run(req);
  // If oneOf fails, badFormatterResult(req).array() throws because AlternativeValidationError has no .path
  const errors = badFormatterResult(req);
  if (\!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() }); // throws here
  }
  res.json({ ok: true });
}

// @expect-clean
// SHOULD_NOT_FIRE: formatter handles all ValidationError types safely
const safeFormatterResult = validationResult.withDefaults({
  formatter: (error) => {
    const field = error.type === 'field' ? (error as any).path : '_alternative';
    return { field, message: error.msg };
  },
});
export async function handleWithSafeFormatter(req: Request, res: Response) {
  await body('email').isEmail().run(req);
  const errors = safeFormatterResult(req);
  if (\!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  res.json({ email: req.body.email });
}
