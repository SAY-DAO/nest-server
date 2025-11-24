import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export type DigikalaResult =
  | { cost: number | 'unavailable'; img: string | null; title: string | null }
  | undefined;

@Injectable()
export class CrawlerService {
  private readonly logger = new Logger(CrawlerService.name);
  private readonly PROXY = 'https://proxy.saydao.org/proxy?url={{url}}';
  private readonly API_URL_NOT_FRESH =
    'https://api.digikala.com/v2/product/%s/';
  private readonly API_URL_FRESH =
    'https://api-fresh.digikala.com/v1/product/%s/';
  // Matches "dkp-123456" anywhere in the URL
  private readonly DKP_PATTERN = /dkp-(\d+)/;

  // helper to keep main logic clear
  private async fetchProxy(
    proxyUrl: string,
  ): Promise<{ httpStatus: number; body: string } | null> {
    try {
      const proxyRes = await axios.get(proxyUrl, {
        validateStatus: () => true,
        timeout: 20000,
        responseType: 'text',
      });

      const body =
        typeof proxyRes.data === 'string'
          ? proxyRes.data
          : JSON.stringify(proxyRes.data);
      return { httpStatus: proxyRes.status, body };
    } catch (err) {
      this.logger.error(`fetchProxy error for ${proxyUrl}: ${String(err)}`);
      return null;
    }
  }

  private buildUrl(template: string, dkp: string) {
    return template.replace('%s', dkp);
  }

  /**
   * Tries `url` first. If that fails, calls proxy with the original URL
   * inserted (URL-encoded) into the `{{url}}` placeholder.
   *
   * Returns { httpStatus, body } on success, otherwise null.
   */
  async callApi(
    url: string,
  ): Promise<{ httpStatus: number; body: any } | null> {
    try {
      const res = await axios.get(url, {
        validateStatus: () => true,
        timeout: 20000,
        responseType: 'text',
      });

      const body =
        typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
      return { httpStatus: res.status, body };
    } catch (primaryError) {
      this.logger.warn(
        `callApi primary error for ${url}: ${String(primaryError)}`,
      );

      // Build proxy URL by replacing {{url}} with the encoded original URL.
      try {
        if (!this.PROXY.includes('{{url}}')) {
          // Defensive: if placeholder missing, append as ?url=...
          this.logger.warn(
            `PROXY missing {{url}} placeholder; appending ?url=encoded(original). PROXY="${this.PROXY}"`,
          );
          const proxyFull =
            this.PROXY +
            (this.PROXY.includes('?') ? '&' : '?') +
            `url=${encodeURIComponent(url)}`;
          return await this.fetchProxy(proxyFull);
        }

        const proxyFullUrl = this.PROXY.replace(
          '{{url}}',
          encodeURIComponent(url),
        );
        this.logger.debug(`Falling back to proxy URL: ${proxyFullUrl}`);

        return await this.fetchProxy(proxyFullUrl);
      } catch (proxyError) {
        this.logger.error(`callApi proxy error: ${String(proxyError)}`);
        return null;
      }
    }
  }

  /**
   * Get parsed product data like the Python crawler.
   * Returns undefined if DKP missing or could not obtain usable response.
   */
  async getData(
    url: string,
  ): Promise<
    | { cost: number | 'unavailable'; img: string | null; title: string | null }
    | undefined
  > {
    const match = this.DKP_PATTERN.exec(url);
    if (!match) {
      this.logger.debug('DKP not found in URL: ' + url);
      return undefined;
    }
    const dkp = match[1];

    try {
      // helper to call an API URL and parse its JSON body (if possible)
      const fetchAndParse = async (
        apiUrl: string,
      ): Promise<{ parsed: any; httpStatus: number } | null> => {
        const apiResp = await this.callApi(apiUrl);
        if (!apiResp || apiResp.body == null) {
          this.logger.warn(`Could not call API or empty body for ${apiUrl}`);
          return null;
        }
        console.log(apiResp);

        let parsed: any;
        if (typeof apiResp.body === 'string') {
          try {
            parsed = JSON.parse(apiResp.body);
          } catch (err) {
            // body is not valid JSON — treat as unusable
            this.logger.warn(
              `API returned non-JSON body for ${apiUrl}: ${String(err)}`,
            );
            return null;
          }
        } else {
          parsed = apiResp.body;
        }

        return { parsed, httpStatus: apiResp.httpStatus };
      };

      // First attempt: not-fresh API
      let apiUrl = this.buildUrl(this.API_URL_NOT_FRESH, dkp);
      let fetched = await fetchAndParse(apiUrl);
      if (!fetched) return undefined;

      let { parsed } = fetched;
      // prefer payload.status (body) but fall back to HTTP status if missing
      const statusNum = Number(parsed?.status ?? fetched.httpStatus ?? NaN);

      // follow fresh redirect if indicated in payload
      if (
        statusNum === 302 &&
        typeof parsed?.redirect_url?.uri === 'string' &&
        parsed.redirect_url.uri.includes('fresh')
      ) {
        apiUrl = this.buildUrl(this.API_URL_FRESH, dkp);
        fetched = await fetchAndParse(apiUrl);
        if (!fetched) return undefined;
        parsed = fetched.parsed;
        if (Number(parsed?.status ?? fetched.httpStatus ?? NaN) !== 200) {
          this.logger.warn('Fresh API returned non-200 status in payload.');
          return undefined;
        }
      } else if (statusNum !== 200) {
        this.logger.warn(
          'Could not update! Unexpected status in API payload.',
          JSON.stringify(parsed),
        );
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

      const title: string | null =
        typeof result.product.title_fa === 'string'
          ? result.product.title_fa
          : null;

      // Compute cost similarly to Python: floor(rrp_price / 10) when marketable
      let cost: number | 'unavailable' = 'unavailable';
      try {
        if (result.product.status === 'marketable') {
          const rrpRaw =
            result.product?.default_variant?.price?.rrp_price ?? NaN;
          const rrp = Number(rrpRaw);
          if (Number.isFinite(rrp) && !Number.isNaN(rrp)) {
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

      // image path: try several fallbacks
      let img: string | null = null;
      try {
        const mainUrls = result.product?.images?.main?.url;
        if (Array.isArray(mainUrls) && mainUrls.length > 0) {
          img = mainUrls[0];
        } else {
          // fallback to list[0].url[0]
          const listFirst = result.product?.images?.list?.[0]?.url;
          if (Array.isArray(listFirst) && listFirst.length > 0)
            img = listFirst[0];
          else img = null;
        }
      } catch (e) {
        img = null;
      }

      return { cost, img, title };
    } catch (err) {
      // last-resort catch; keep function safe
      this.logger.error('Unexpected error in getData: ' + String(err));
      return undefined;
    }
  }
}
