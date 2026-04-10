import puppeteer, { Browser, Page } from 'puppeteer';

/**
 * ✅ PROPER: puppeteer.launch() with try-catch-finally
 * Should NOT trigger violations
 */
async function screenshotWithProperHandling(url: string): Promise<Buffer | null> {
  let browser: Browser | undefined;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto(url, { timeout: 60000 });
    const screenshot = await page.screenshot();

    return screenshot;
  } catch (error) {
    if (error.name === 'TimeoutError') {
      console.error('Navigation timeout:', error);
    } else {
      console.error('Browser automation failed:', error);
    }
    return null;
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        // Ignore close errors to avoid masking original error
      }
    }
  }
}

/**
 * ✅ PROPER: page.goto() with timeout handling
 * Should NOT trigger violations
 */
async function navigateWithProperHandling(page: Page, url: string): Promise<boolean> {
  try {
    const response = await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    // CRITICAL: Check HTTP status in headless shell mode
    if (!response || !response.ok()) {
      throw new Error(`HTTP ${response?.status()}`);
    }

    return true;
  } catch (error) {
    if (error.name === 'TimeoutError') {
      console.error('Navigation timeout:', error);
    }
    return false;
  }
}

/**
 * ✅ PROPER: browser.newPage() with error handling
 * Should NOT trigger violations
 */
async function createPageWithProperHandling(browser: Browser): Promise<Page | null> {
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    return page;
  } catch (error) {
    if (error.name === 'ProtocolError') {
      console.error('Protocol error creating page:', error);
    }
    return null;
  }
}

/**
 * ✅ PROPER: page.waitForSelector() with timeout handling
 * Should NOT trigger violations
 */
async function waitForElementWithProperHandling(page: Page, selector: string): Promise<boolean> {
  try {
    await page.waitForSelector(selector, { timeout: 10000 });
    return true;
  } catch (error) {
    if (error.name === 'TimeoutError') {
      console.error('Element not found:', selector);
    }
    return false;
  }
}

/**
 * ✅ PROPER: page.click() with error handling
 * Should NOT trigger violations
 */
async function clickElementWithProperHandling(page: Page, selector: string): Promise<boolean> {
  try {
    await page.click(selector);
    return true;
  } catch (error) {
    console.error('Click failed:', error);
    return false;
  }
}

/**
 * ✅ PROPER: Complete example with all operations
 * Should NOT trigger violations
 */
async function scrapePageProper(url: string): Promise<string | null> {
  let browser: Browser | undefined;

  try {
    browser = await puppeteer.launch({
      headless: true,
      timeout: 60000,
      protocolTimeout: 120000
    });

    const page = await browser.newPage();

    const response = await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    if (!response || !response.ok()) {
      throw new Error(`Navigation failed: ${response?.status()}`);
    }

    await page.waitForSelector('h1', { timeout: 10000 });

    const title = await page.evaluate(() => {
      return document.querySelector('h1')?.textContent;
    });

    return title || null;
  } catch (error) {
    console.error('Scraping failed:', error);
    return null;
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        // Ignore close errors
      }
    }
  }
}
