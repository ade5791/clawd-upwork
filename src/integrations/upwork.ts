import { chromium } from "playwright";

type ScrapeFilters = {
  paymentVerified?: boolean;
  proposalsMax?: number;
};

export async function scrapeUpwork(search: string, filters: ScrapeFilters = {}) {
  const browser = await chromium.launch({ headless: false, slowMo: 50 });
  const page = await browser.newPage();
  page.setDefaultTimeout(60000);

  // NOTE: this expects the user session to be logged in.
  await page.goto("https://www.upwork.com/nx/find-work/", { waitUntil: "domcontentloaded" });

  const searchBox = page.locator('input[placeholder="Search"]').first();
  await searchBox.waitFor({ state: "visible" });
  await searchBox.fill(search);
  await page.locator('button:has-text("Search")').first().click();

  // Apply a couple of simple filters if present
  if (filters.paymentVerified) {
    const pv = page.getByLabel("Payment verified");
    if (await pv.count()) await pv.first().check();
  }

  // TODO: proposals filter in UI if needed

  await page.waitForTimeout(3000);

  const cards = page.locator('section[data-test="job-tile"]');
  const count = await cards.count();
  const items: any[] = [];

  for (let i = 0; i < Math.min(count, 10); i++) {
    const card = cards.nth(i);
    const title = await card.locator('a[data-test="job-title-link"]').innerText().catch(() => "");
    const url = await card.locator('a[data-test="job-title-link"]').getAttribute("href").catch(() => "");
    const budgetText = await card.locator('[data-test="job-type"] + div').innerText().catch(() => "");
    const skills = await card.locator('[data-test="skills"] a').allInnerTexts().catch(() => []);

    items.push({
      title: title.trim(),
      url: url ? `https://www.upwork.com${url}` : undefined,
      budget: parseBudget(budgetText),
      skills
    });
  }

  await browser.close();
  return items;
}

function parseBudget(text: string) {
  const m = text.match(/\$([0-9,.]+)/);
  if (!m) return undefined;
  return Number(m[1].replace(/,/g, ""));
}
