/**
 * puppeteer Ground-Truth Fixture
 *
 * Each call site is annotated // SHOULD_FIRE or // SHOULD_NOT_FIRE.
 * Derived from the contract spec, NOT V1 behavior.
 *
 * Contracted functions (from import "puppeteer"):
 *   - puppeteer.launch()           postcondition: launch-rejects-on-error
 *   - browser.close()              postcondition: browser-close-must-run
 *   - page.evaluate()              postcondition: evaluate-execution-error
 *   - page.screenshot()            postcondition: screenshot-protocol-error
 *   - page.pdf()                   postcondition: pdf-headless-only-error
 *   - page.setContent()            postcondition: setcontent-timeout-error
 *   - page.waitForNavigation()     postcondition: waitfornavigation-timeout-error
 *   - page.waitForNetworkIdle()    postcondition: waitfornetworkidle-timeout-error
 *   - page.waitForFunction()       postcondition: waitforfunction-timeout-error
 *   - page.type()                  postcondition: type-element-not-found
 *   - page.$eval()                 postcondition: eval-element-not-found
 *   - puppeteer.connect()          postcondition: connect-websocket-error
 *
 * Detection path: puppeteer imported → method call →
 *   ThrowingFunctionDetector fires → ContractMatcher checks try-catch →
 *   postcondition fires
 */

import puppeteer from 'puppeteer';

// ─────────────────────────────────────────────────────────────────────────────
// 1. puppeteer.launch() — direct call without try-catch
// ─────────────────────────────────────────────────────────────────────────────

export async function launchNoCatch() {
  // SHOULD_FIRE: launch-rejects-on-error — launch throws on Chrome not found, port conflict, timeout. No try-catch.
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://example.com');
  await browser.close();
}

export async function launchWithCatch() {
  try {
    // SHOULD_NOT_FIRE: launch() inside try-catch satisfies error handling
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('https://example.com');
    await browser.close();
  } catch (err) {
    console.error('Browser launch failed:', err);
    throw err;
  }
}

export async function launchHeadedNoCatch() {
  // SHOULD_FIRE: launch-rejects-on-error — headed launch also throws on display issues. No try-catch.
  const browser = await puppeteer.launch({ headless: false, args: ['--no-sandbox'] });
  await browser.close();
}

export async function launchHeadedWithCatch() {
  try {
    // SHOULD_NOT_FIRE: headed launch inside try-catch
    const browser = await puppeteer.launch({ headless: false, args: ['--no-sandbox'] });
    await browser.close();
  } catch (err) {
    console.error('Headed browser launch failed:', err);
    throw err;
  }
}

export async function screenshotNoCatch(url: string) {
  // SHOULD_FIRE: launch-rejects-on-error — screenshot workflow starts with launch. No try-catch.
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  const screenshot = await page.screenshot();
  await browser.close();
  return screenshot;
}

export async function screenshotWithCatch(url: string) {
  try {
    // SHOULD_NOT_FIRE: full screenshot workflow inside try-catch
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    const screenshot = await page.screenshot();
    await browser.close();
    return screenshot;
  } catch (err) {
    console.error('Screenshot failed:', err);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. browser.close() in catch block — concern-20260401-puppeteer-1
//    browser.close() called in the catch path satisfies browser-close-must-run
// ─────────────────────────────────────────────────────────────────────────────

export async function closeInCatchBlock(url: string) {
  let browser: any;
  try {
    browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    const result = await page.evaluate(() => document.title);
    await browser.close();
    return result;
  } catch (err) {
    if (browser) {
      try {
        // SHOULD_NOT_FIRE: browser.close() in catch block satisfies browser-close-must-run (cleanup-on-error pattern).
        await browser.close();
      } catch (closeErr) { /* ignore */ }
    }
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. browser.close() in finally block — concern-20260401-puppeteer-2
//    finally guarantees execution (success AND error), satisfying browser-close-must-run
// ─────────────────────────────────────────────────────────────────────────────

export async function closeInFinallyBlock(url: string) {
  let browser: any;
  try {
    browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    return await page.evaluate(() => document.title);
  } finally {
    if (browser) {
      // SHOULD_NOT_FIRE: browser.close() in finally block guarantees cleanup — satisfies browser-close-must-run.
      await browser.close();
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. page.evaluate() — new in depth pass
// ─────────────────────────────────────────────────────────────────────────────

export async function evaluateNoCatch() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://example.com');
  // SHOULD_NOT_FIRE: scanner gap — evaluate-execution-error — evaluate can throw TargetCloseError, ProtocolError. No try-catch.
  const title = await page.evaluate(() => document.title);
  await browser.close();
  return title;
}

export async function evaluateWithCatch() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://example.com');
  try {
    // SHOULD_NOT_FIRE: evaluate inside try-catch
    const title = await page.evaluate(() => document.title);
    return title;
  } catch (err) {
    console.error('Evaluate failed:', err);
    return null;
  } finally {
    await browser.close();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. page.screenshot() — new in depth pass
// ─────────────────────────────────────────────────────────────────────────────

export async function screenshotOnlyNoCatch(url: string) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  // SHOULD_NOT_FIRE: scanner gap — screenshot-protocol-error — screenshot can throw TargetCloseError, crop Error. No try-catch.
  const buf = await page.screenshot({ fullPage: true });
  await browser.close();
  return buf;
}

export async function screenshotOnlyWithCatch(url: string) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  try {
    // SHOULD_NOT_FIRE: screenshot inside try-catch
    const buf = await page.screenshot({ fullPage: true });
    return buf;
  } catch (err) {
    console.error('Screenshot failed:', err);
    return null;
  } finally {
    await browser.close();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. page.pdf() — new in depth pass
// ─────────────────────────────────────────────────────────────────────────────

export async function pdfNoCatch(html: string) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html);
  // SHOULD_NOT_FIRE: scanner gap — pdf-headless-only-error — pdf throws in headed mode, ProtocolError on CDP failure. No try-catch.
  const pdfBuffer = await page.pdf({ format: 'A4' });
  await browser.close();
  return pdfBuffer;
}

export async function pdfWithCatch(html: string) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  try {
    await page.setContent(html);
    // SHOULD_NOT_FIRE: pdf inside try-catch
    const pdfBuffer = await page.pdf({ format: 'A4' });
    return pdfBuffer;
  } catch (err) {
    console.error('PDF generation failed:', err);
    return null;
  } finally {
    await browser.close();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. page.setContent() — new in depth pass
// ─────────────────────────────────────────────────────────────────────────────

export async function setContentNoCatch(html: string) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  // SHOULD_NOT_FIRE: scanner gap — setcontent-timeout-error — setContent can timeout on complex HTML. No try-catch.
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await browser.close();
}

export async function setContentWithCatch(html: string) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  try {
    // SHOULD_NOT_FIRE: setContent inside try-catch
    await page.setContent(html, { waitUntil: 'networkidle0' });
  } catch (err) {
    console.error('setContent failed:', err);
  } finally {
    await browser.close();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. page.waitForNavigation() — new in depth pass
// ─────────────────────────────────────────────────────────────────────────────

export async function waitForNavigationNoCatch() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://example.com');
  // SHOULD_NOT_FIRE: scanner gap — waitfornavigation-timeout-error — waitForNavigation can timeout. No try-catch.
  await page.waitForNavigation({ waitUntil: 'networkidle0' });
  await browser.close();
}

export async function waitForNavigationWithCatch() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://example.com');
  try {
    // SHOULD_NOT_FIRE: waitForNavigation inside try-catch
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 30000 });
  } catch (err) {
    console.error('Navigation timeout:', err);
  } finally {
    await browser.close();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. page.waitForNetworkIdle() — new in depth pass
// ─────────────────────────────────────────────────────────────────────────────

export async function waitForNetworkIdleNoCatch() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://example.com');
  // SHOULD_NOT_FIRE: scanner gap — waitfornetworkidle-timeout-error — can timeout on busy pages. No try-catch.
  await page.waitForNetworkIdle({ idleTime: 500 });
  await browser.close();
}

export async function waitForNetworkIdleWithCatch() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://example.com');
  try {
    // SHOULD_NOT_FIRE: waitForNetworkIdle inside try-catch
    await page.waitForNetworkIdle({ idleTime: 500 });
  } catch (err) {
    console.error('Network idle timeout:', err);
  } finally {
    await browser.close();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. page.waitForFunction() — new in depth pass
// ─────────────────────────────────────────────────────────────────────────────

export async function waitForFunctionNoCatch() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://example.com');
  // SHOULD_NOT_FIRE: scanner gap — waitforfunction-timeout-error — can timeout when condition never met. No try-catch.
  await page.waitForFunction('document.querySelector(".loaded") !== null');
  await browser.close();
}

export async function waitForFunctionWithCatch() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://example.com');
  try {
    // SHOULD_NOT_FIRE: waitForFunction inside try-catch
    await page.waitForFunction('document.querySelector(".loaded") !== null', { timeout: 10000 });
  } catch (err) {
    console.error('Wait function timeout:', err);
  } finally {
    await browser.close();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. page.type() — new in depth pass
// ─────────────────────────────────────────────────────────────────────────────

export async function typeNoCatch() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://example.com');
  // SHOULD_NOT_FIRE: scanner gap — type-element-not-found — throws if selector not found. No try-catch.
  await page.type('#search-input', 'hello world');
  await browser.close();
}

export async function typeWithCatch() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://example.com');
  try {
    // SHOULD_NOT_FIRE: type inside try-catch
    await page.type('#search-input', 'hello world');
  } catch (err) {
    console.error('Type failed:', err);
  } finally {
    await browser.close();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 12. page.$eval() — new in depth pass
// ─────────────────────────────────────────────────────────────────────────────

export async function evalNoCatch() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://example.com');
  // SHOULD_NOT_FIRE: scanner gap — eval-element-not-found — $eval throws if selector not found (unlike $() which returns null). No try-catch.
  const text = await page.$eval('h1', (el) => el.textContent);
  await browser.close();
  return text;
}

export async function evalWithCatch() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://example.com');
  try {
    // SHOULD_NOT_FIRE: $eval inside try-catch
    const text = await page.$eval('h1', (el) => el.textContent);
    return text;
  } catch (err) {
    console.error('$eval failed:', err);
    return null;
  } finally {
    await browser.close();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 13. puppeteer.connect() — new in depth pass
// ─────────────────────────────────────────────────────────────────────────────

export async function connectNoCatch(wsUrl: string) {
  // SHOULD_FIRE: connect-websocket-error — connect can fail on wrong URL, browser not running. No try-catch.
  const browser = await puppeteer.connect({ browserWSEndpoint: wsUrl });
  const page = await browser.newPage();
  await page.goto('https://example.com');
  await browser.close();
}

export async function connectWithCatch(wsUrl: string) {
  try {
    // SHOULD_NOT_FIRE: connect inside try-catch
    const browser = await puppeteer.connect({ browserWSEndpoint: wsUrl });
    const page = await browser.newPage();
    await page.goto('https://example.com');
    await browser.close();
  } catch (err) {
    console.error('Connect failed:', err);
  }
}
