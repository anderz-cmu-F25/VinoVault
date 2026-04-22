/**
 * Fetches the latest price for a single wine from its wine.com product page
 * via ScraperAPI, using the same sharify-data parsing strategy as scripts/scraper.js.
 *
 * Returns null (and logs a warning) when SCRAPERAPI_KEY is absent or the page
 * cannot be parsed — callers should treat null as "price unchanged".
 */

export interface WinePrice {
  regularPrice: number | null;
  salePrice: number | null;
}

/** Converts wine.com's { whole, fractional } price object to a float. */
function parsePriceField(
  priceObj: { whole?: number; fractional?: number } | null | undefined
): number | null {
  if (!priceObj || priceObj.whole == null) return null;
  const frac = String(priceObj.fractional ?? 0).padStart(2, "0");
  return parseFloat(`${priceObj.whole}.${frac}`);
}

export async function fetchWinePrice(wineUrl: string): Promise<WinePrice | null> {
  const apiKey = process.env.SCRAPERAPI_KEY;
  if (!apiKey) {
    console.warn("[priceFetcher] SCRAPERAPI_KEY not set — skipping price refresh");
    return null;
  }

  const fetchUrl = `http://api.scraperapi.com?api_key=${encodeURIComponent(apiKey)}&url=${encodeURIComponent(wineUrl)}`;

  try {
    const response = await fetch(fetchUrl, {
      signal: AbortSignal.timeout(60_000),
    });

    if (!response.ok) {
      console.error(`[priceFetcher] HTTP ${response.status} for ${wineUrl}`);
      return null;
    }

    const html = await response.text();

    // Detect Cloudflare / WAF challenge pages
    if (/<title[^>]*>[^<]*(just a moment|access denied)/i.test(html)) {
      console.error(`[priceFetcher] WAF block detected for ${wineUrl}`);
      return null;
    }

    // Extract the inline sharify JSON block (same approach as scraper.js)
    const match = html.match(/<script[^>]*name="sharify"[^>]*>([\s\S]*?)<\/script>/i);
    if (!match) {
      console.error(`[priceFetcher] sharify data block not found for ${wineUrl}`);
      return null;
    }

    const jsonString = match[1]
      .trim()
      .replace(/^window\.__sharifyData\s*=\s*/, "")
      .replace(/;?\s*$/, "");

    const data = JSON.parse(jsonString);

    // wine.com product pages expose the item under model.product.catalogModel
    // List pages expose it under model.collection.models[0].catalogModel
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let catalog: any =
      data?.model?.product?.catalogModel ??
      data?.model?.collection?.models?.[0]?.catalogModel;

    if (!catalog) {
      console.error(`[priceFetcher] No catalog data found in sharify for ${wineUrl}`);
      return null;
    }

    const regularPrice = parsePriceField(catalog.regularPrice);
    const salePrice = parsePriceField(catalog.salePrice) ?? regularPrice;

    return { regularPrice, salePrice };
  } catch (err) {
    console.error(`[priceFetcher] Unexpected error for ${wineUrl}:`, err);
    return null;
  }
}
