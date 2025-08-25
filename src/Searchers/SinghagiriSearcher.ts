import {Searcher} from "./Searcher.js";
import {Page} from "@playwright/test";
import {BrowserManager} from "../BrowserManager.js";
import {Extractor} from "../Extractors/Extractor.js";
import {SinghagiriExtractor} from "../Extractors/SinghagiriExtractor.js";

class SinghagiriSearcher extends Searcher {
    constructor(query: string) {
        super(query, "Singhagiri");
    }
    
    async doSearch(): Promise<string[]> {
        const browser = await BrowserManager.getBrowser("singhagiri")
        
        const encodedQuery = encodeURIComponent(this.query);
        let searchUrl = `https://singhagiri.lk/filter?search=${encodedQuery}`;
        let productUrls = new Set<string>();
        while (true) {
            const page = await browser.newPage();
            await page.goto(searchUrl);
            await page.waitForLoadState("networkidle", {timeout: 60000});
            
            
            console.debug(`Navigating to next page: ${searchUrl}`);
            const initialSize = productUrls.size;
            
            const newUrls = await this.getListItems(page);
            console.debug(`Found ${newUrls.length} products`);
            for (const url of newUrls) {
                productUrls.add(url);
            }
            
            if (productUrls.size === initialSize) {
                console.debug("No new items were found, stopping pagination.");
                await page.close();
                break;
            }
            
            const nextPageUrl = await this.getNextPageUrl(page);
            await page.close();
            
            if (nextPageUrl) {
                searchUrl = nextPageUrl;
            } else {
                break
            }
        }
        
        return [...new Set(productUrls)];
    }
    
    async getListItems(page: Page): Promise<string[]> {
        await page.waitForLoadState("networkidle");
        const productWrappers = await page.$$(".product a");
        const productUrls: string[] = [];
        for (const wrapper of productWrappers) {
            const url = await wrapper.getAttribute("href");
            if (url && url.startsWith("https://singhagiri.lk/product/")) {
                productUrls.push(url);
            }
        }
        
        return productUrls;
    }
    
    async getNextPageUrl(page: Page): Promise<null | string> {
        const nextPageButton = await page.$("a[rel='next']");
        const url = await nextPageButton?.getAttribute("href");
        if (url) {
            return url
        }
        return null
    }
    
    getExtractor(url: string): Extractor {
        return new SinghagiriExtractor(url);
    }
}

export {SinghagiriSearcher};
