import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export type DigikalaResult =
  | { cost: number | 'unavailable'; img: string | null; title: string | null }
  | undefined;

@Injectable()
export class CrawlerService {
  private readonly logger = new Logger(CrawlerService.name);
  private readonly API_URL_NOT_FRESH = 'https://api.digikala.com/v2/product/%s/';
  private readonly API_URL_FRESH = 'https://api-fresh.digikala.com/v1/product/%s/';
  // Matches "dkp-123456" anywhere in the URL
  private readonly DKP_PATTERN = /dkp-(\d+)/;

  private buildUrl(template: string, dkp: string) {
    return template.replace('%s', dkp);
  }

  private async callApi(url: string): Promise<{ httpStatus: number; body: any } | null> {
    try {
      // validateStatus: always true -> axios won't throw on non-2xx, we get body to inspect API's "status"
      const res = await axios.get(url, { validateStatus: () => true, timeout: 8000 });
      return { httpStatus: res.status, body: res.data };
    } catch (e) {
      this.logger.warn(`callApi error for ${url}: ${String(e)}`);
      return null;
    }
  }

  /**
   * Get parsed product data like the Python crawler.
   * Returns undefined if DKP missing or could not obtain usable response.
   */
  async getData(url: string,): Promise<DigikalaResult> {
    const match = this.DKP_PATTERN.exec(url);
    if (!match) {
      // DKP not found
      this.logger.debug('DKP not found in URL: ' + url);
      return undefined;
    }
    const dkp = match[1];

    // First attempt: not-fresh API
    let apiUrl = this.buildUrl(this.API_URL_NOT_FRESH, dkp);
    let apiResp = await this.callApi(apiUrl);
    if (!apiResp || apiResp.body == null) {
      this.logger.warn('Could not call not-fresh API or empty body.');
      return undefined;
    }

    let parsed = apiResp.body;

    // Logic mirrors the python: check API-level `status` field (returned in JSON)
    // Some endpoints use HTTP status and some put "status" inside body. We follow body.status like original.
    if (parsed?.status === 200) {
      // good — keep parsed
    } else if (parsed?.status === 302 && parsed?.redirect_url?.uri?.includes('fresh')) {
      // follow to fresh API
      apiUrl = this.buildUrl(this.API_URL_FRESH, dkp);
      apiResp = await this.callApi(apiUrl);
      if (!apiResp || apiResp.body == null) {
        this.logger.warn('Could not call fresh API or empty body.');
        return undefined;
      }
      parsed = apiResp.body;
      if (parsed?.status !== 200) {
        this.logger.warn('Fresh API returned non-200 status in payload.');
        return undefined;
      }
    } else {
      this.logger.warn('Could not update! Unexpected status in API payload.', JSON.stringify(parsed));
      this.logger.debug('Tried URL: ' + apiUrl);
      return undefined;
    }

    // At this point parsed should contain the API JSON with a `data` property
    const result = parsed?.data;
    if (!result || !result.product) {
      this.logger.warn('No product data in parsed response.');
      return undefined;
    }

    // If product is marked inactive -> return the same unavailable shape as Python
    if (result.product.is_inactive) {
      return { cost: 'unavailable', img: null, title: null };
    }

    const title: string | null = result.product.title_fa ?? null;

    let cost: number | 'unavailable' = 'unavailable';
    try {
      if (result.product.status === 'marketable') {
        // Python used: int(rrp_price) // 10
        const rrp = Number(result.product?.default_variant?.price?.rrp_price ?? NaN);
        if (!Number.isNaN(rrp)) {
          cost = Math.floor(rrp / 10);
        } else {
          cost = 'unavailable';
        }
      } else {
        cost = 'unavailable';
      }
    } catch (e) {
      this.logger.debug('Error while computing cost: ' + String(e));
      cost = 'unavailable';
    }

    // image path: result['product']['images']['main']['url'][0] in Python
    let img: string | null = null;
    try {
      const urls = result.product?.images?.main?.url;
      if (Array.isArray(urls) && urls.length > 0) img = urls[0];
    } catch (e) {
      img = null;
    }

    return { cost, img, title };
  }
}
