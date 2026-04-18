import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import { gotScraping } from 'got-scraping';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load env from root .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Set WINE_COM_COOKIE in .env.local (copy from browser DevTools -> any wine.com request -> cookie header).
// Cookies expire after a few hours — refresh before each scrape run.
const MY_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36';
const MY_COOKIE = process.env.WINE_COM_COOKIE;

// Set WINE_COM_BASE_URL in .env.local to scrape a different category. Defaults to category 7155.
const BASE_URL = process.env.WINE_COM_BASE_URL || 'https://www.wine.com/list/wine/7155';

// Reject cookies containing non-ASCII characters (caused by IME converting digits to full-width).
function validateCookie(cookie) {
  // eslint-disable-next-line no-control-regex
  if (/[^\x00-\x7F]/.test(cookie)) {
    console.error('Error: WINE_COM_COOKIE contains non-ASCII characters (likely full-width digits from IME).');
    console.error('Switch to English input, re-copy the cookie from the browser, and update .env.local.');
    process.exit(1);
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function scrapeWinePage(pageNumber) {
  const url = pageNumber === 1 ? BASE_URL : `${BASE_URL}/${pageNumber}`;
  console.log(`[+] Fetching page ${pageNumber}: ${url}...`);

  try {
    const response = await gotScraping({
      url,
      headers: {
        'user-agent': MY_USER_AGENT,
        accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'accept-language': 'en-US,en;q=0.9',
        cookie: MY_COOKIE,
      },
    });

    const $ = cheerio.load(response.body);

    const pageTitle = $('title').text();
    if (pageTitle.includes('Just a moment') || pageTitle.includes('Access Denied')) {
      console.error(`[-] Page ${pageNumber} blocked by WAF. Cookie may be expired — update .env.local.`);
      return [];
    }

    const scriptContent =
      $('script[name="sharify"]').html() || $('script[name="sharify"]').text();

    if (!scriptContent) {
      console.error(`[-] Page ${pageNumber}: sharify data block not found. Page structure may have changed.`);
      return [];
    }

    let jsonString = scriptContent.trim();
    jsonString = jsonString.replace(/^window\.__sharifyData\s*=\s*/, '');
    jsonString = jsonString.replace(/;?\s*$/, '');

    const data = JSON.parse(jsonString);
    const wineModels = data?.model?.collection?.models || [];
    const winesOnPage = [];

    wineModels.forEach((wine) => {
      const catalog = wine.catalogModel;
      if (!catalog) return;

      const regPrice = catalog.regularPrice
        ? parseFloat(`${catalog.regularPrice.whole}.${catalog.regularPrice.fractional}`)
        : null;
      const salePrice = catalog.salePrice
        ? parseFloat(`${catalog.salePrice.whole}.${catalog.salePrice.fractional}`)
        : null;

      winesOnPage.push({
        id: catalog.id,
        name: catalog.fullName,
        vintage: catalog.vintage,
        region: catalog.origin,
        stock: catalog.stock,
        regularPrice: regPrice,
        salePrice: salePrice || regPrice,
        rating: wine.averageRatingModel?.ratingsAverageDisplay || null,
      });
    });

    return winesOnPage;
  } catch (error) {
    console.error(`[-] Page ${pageNumber} error: ${error.message}`);
    return [];
  }
}

async function runScraper() {
  console.log('Starting scrape (cookie injection mode)...\n');

  if (!MY_COOKIE) {
    console.error('Error: WINE_COM_COOKIE is not set. Add it to .env.local:');
    console.error('  WINE_COM_COOKIE="visitor_id=xxx; datadome=xxx; ..."');
    process.exit(1);
  }
  validateCookie(MY_COOKIE);

  let allWines = [];
  const START_PAGE = 1;
  const END_PAGE = 50; // 25 wines/page — stops automatically on empty page

  for (let i = START_PAGE; i <= END_PAGE; i++) {
    const wines = await scrapeWinePage(i);

    if (wines.length === 0) {
      console.log('No data on this page — stopping.');
      break;
    }

    allWines = allWines.concat(wines);
    console.log(`[v] Parsed ${wines.length} wines, total so far: ${allWines.length}`);

    const delay = Math.floor(Math.random() * 2000) + 2000;
    console.log(`[zzz] Sleeping ${delay}ms...\n`);
    await sleep(delay);
  }

  if (allWines.length > 0) {
    const outputPath = path.join(__dirname, 'wine_data.json');
    await fs.writeFile(outputPath, JSON.stringify(allWines, null, 2));
    console.log(`\nDone! ${allWines.length} wines saved to scripts/wine_data.json`);
    console.log('Run "npm run seed" to import into MongoDB.');
  } else {
    console.log('Scrape failed — no data collected.');
  }
}

runScraper();
