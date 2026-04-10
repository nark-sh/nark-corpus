import puppeteer, { Browser, Page } from 'puppeteer';

/**
 * ❌ MISSING: puppeteer.launch() without try-catch
 * Should trigger ERROR violation
 */
async function screenshotBad(url: string) {
  const browser = await puppeteer.launch(); // No try-catch - will crash on timeout
  const page = await browser.newPage();
  await page.goto(url);
  const screenshot = await page.screenshot();
  await browser.close();
  return screenshot;
}

/**
 * ❌ MISSING: page.goto() without try-catch
 * Should trigger ERROR violation
 */
async function navigateBad(page: Page, url: string) {
  await page.goto(url); // No try-catch - will crash on timeout
  return true;
}

/**
 * ❌ MISSING: browser.newPage() without try-catch
 * Should trigger ERROR violation
 */
async function createPageBad(browser: Browser) {
  const page = await browser.newPage(); // No try-catch - will crash on protocol error
  return page;
}

/**
 * ❌ MISSING: browser not closed in finally block
 * Should trigger WARNING violation
 */
async function noFinallyBlock(url: string) {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    await browser.close(); // Not in finally - zombie process if error occurs
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
  // Missing finally block - browser leaked on error
}

/**
 * ❌ MISSING: page.waitForSelector() without try-catch
 * Should trigger WARNING violation
 */
async function waitForElementBad(page: Page, selector: string) {
  await page.waitForSelector(selector); // No try-catch - will crash on timeout
  return true;
}

/**
 * ❌ MISSING: page.click() without try-catch
 * Should trigger WARNING violation
 */
async function clickElementBad(page: Page, selector: string) {
  await page.click(selector); // No try-catch - will crash if element not found
  return true;
}

/**
 * ❌ MISSING: Multiple violations - common anti-pattern from official examples
 * Should trigger MULTIPLE violations
 */
async function officialExamplePattern(url: string) {
  const browser = await puppeteer.launch(); // ❌ No try-catch
  const page = await browser.newPage(); // ❌ No try-catch
  await page.goto(url); // ❌ No try-catch
  await page.screenshot({ path: 'screenshot.png' });
  await browser.close(); // ❌ Not in finally block
}

/**
 * ❌ MISSING: Async IIFE pattern (common in examples)
 * Should trigger MULTIPLE violations
 */
(async () => {
  const browser = await puppeteer.launch(); // ❌ No try-catch
  const page = await browser.newPage(); // ❌ No try-catch
  await page.goto('https://example.com'); // ❌ No try-catch
  await browser.close(); // ❌ Not in finally block
})();

/**
 * ❌ MISSING: Generic catch without browser cleanup
 * Should trigger WARNING violation
 */
async function genericCatchNoCleanup(url: string) {
  const browser = await puppeteer.launch();

  try {
    const page = await browser.newPage();
    await page.goto(url);
  } catch (error) {
    console.error('Error:', error);
    // ❌ Missing: await browser.close() in catch/finally
  }
  // Browser leaked if error occurs
}

/**
 * ❌ MISSING: Navigation without HTTP status check
 * Should trigger ERROR violation + anti-pattern
 */
async function noStatusCheck(url: string) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // In headless shell mode, goto() doesn't throw on 404/500
  await page.goto(url); // ❌ No try-catch AND no response.ok() check

  // This will scrape a 404 page silently!
  const content = await page.content();

  await browser.close();
  return content;
}
