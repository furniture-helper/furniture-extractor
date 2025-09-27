import {Extractor} from "../Extractors/Extractor.js";
import {Statistics} from "../Statistics.js";
import {BrowserManager} from "../BrowserManager.js";
import {Page} from "@playwright/test";
import {ElementHandle} from "playwright-core";
import {save_html} from "../utils/file-utils.js";

abstract class Searcher {
    protected queries: string[];
    protected category: string;

    public constructor(queries: string[], category: string) {
        this.queries = queries;
        this.category = category;
    }

    abstract get vendor(): string;

    abstract get searchUrlPrefix(): string;

    abstract get searchUrlSuffix(): string;

    abstract get noResultsIndicator(): string;

    abstract get searchResultsContainerIndicator(): string;

    abstract get productLinkIndicator(): string;

    abstract get productUrlPrefix(): string;

    abstract get nextPageIndicator(): string;

    abstract getExtractor(url: string): Extractor

    public async search(): Promise<string[]> {
        let allProductUrls: string[] = [];

        for (const query of this.queries) {
            console.debug(`Searching for "${query}" at ${this.vendor}...`);

            let retries = 3
            while (retries > 0) {
                try {
                    const productUrls = await this.doSearch(query);
                    console.debug(`Found ${productUrls.length} products for query "${query}" at ${this.vendor}`);
                    allProductUrls.push(...productUrls);
                    break
                } catch (error) {
                    retries -= 1;
                    await new Promise(res => setTimeout(res, 1000));
                    console.warn(`Warning: error while searching for "${query}" at ${this.vendor}:`, error);
                }
            }

            if ((retries === 0) && (allProductUrls.length === 0)) {
                Statistics.recordError()
                console.error(`Error: failed to search for "${query}" at ${this.vendor} after multiple attempts.`);
            }
        }

        allProductUrls = [...new Set(allProductUrls)]
        Statistics.recordProductFetched(this.vendor, this.category, allProductUrls.length)
        console.log(`Total products found at ${this.vendor} = ${allProductUrls.length}`);

        return allProductUrls
    }

    protected waitForNetworkIdle(): boolean {
        return true;
    }

    private async doSearch(query: string): Promise<string[]> {
        const browser = await BrowserManager.getBrowser(this.vendor)
        const encodedQuery = encodeURIComponent(query);
        let searchUrl = `${this.searchUrlPrefix}${encodedQuery}${this.searchUrlSuffix}`;
        console.debug(`Navigating to search URL: ${searchUrl}`);

        const page = await browser.newPage();

        let redirectUri: string = "";
        page.on('response', response => {
            if (response.status() === 302) {
                const location = response.headers()['location'];
                if (location) {
                    redirectUri = location;
                }
            }
        });

        try {
            await page.goto(searchUrl, {timeout: 60000, waitUntil: "load"});
            if (this.waitForNetworkIdle()) await page.waitForLoadState("networkidle", {timeout: 60000});

            if (redirectUri != "" && redirectUri.startsWith(this.productUrlPrefix)) {
                console.debug(`Detected redirect to ${redirectUri}.`);
                return [redirectUri];
            }
        } catch (error) {
            save_html(await page.content(), `search-${this.vendor}-${query.replace(/\s+/g, '_')}.html`)
            throw error;
        }

        let productUrls = new Set<string>();
        while (true) {
            console.debug(`Navigating to next page...`);

            try {
                await page.waitForLoadState("load", {timeout: 60000});
                if (this.waitForNetworkIdle()) await page.waitForLoadState("networkidle", {timeout: 60000});

                const noResultsElement = await page.$(this.noResultsIndicator);
                if (noResultsElement) {
                    const isVisible = await noResultsElement.isVisible();
                    if (isVisible) {
                        console.debug("No results found, stopping pagination.");
                        break;
                    }
                }

                await page.waitForSelector(this.searchResultsContainerIndicator, {timeout: 60000});
            } catch (error) {
                save_html(await page.content(), `search-${this.vendor}-${query.replace(/\s+/g, '_')}.html`)
                throw error;
            }

            const initialSize = productUrls.size;

            const newUrls = await this.getListItems(page);
            console.debug(`Found ${newUrls.length} products`);
            for (const url of newUrls) {
                productUrls.add(url);
            }

            if (productUrls.size === initialSize) {
                console.debug("No new items were found, stopping pagination.");
                break;
            }

            const nextPageButton = await this.getNextPageButton(page);

            if (nextPageButton) {
                await nextPageButton.click();
                await new Promise(resolve => setTimeout(resolve, 5000));
            } else {
                break
            }
        }

        await page.close();
        return [...new Set(productUrls)];
    }

    private async getListItems(page: Page): Promise<string[]> {
        const productWrappers = await page.$$(this.productLinkIndicator);

        const productUrls: string[] = [];
        for (const wrapper of productWrappers) {
            let url = await wrapper.getAttribute("href");
            if (url && url.startsWith(this.productUrlPrefix)) {
                if (!url.includes(this.getSiteRoot())) url = this.getSiteRoot() + url;
                console.debug(`Found ${url}`);
                productUrls.push(url);
            }
        }

        return productUrls;
    }

    private async getNextPageButton(page: Page): Promise<null | ElementHandle> {
        const nextPageButtons = await page.$$(this.nextPageIndicator);
        if (nextPageButtons.length === 0) {
            return null;
        }

        return nextPageButtons[nextPageButtons.length - 1]
    }

    private getSiteRoot(): string {
        const url = new URL(this.searchUrlPrefix);
        return url.origin;
    }
}

export {Searcher};
