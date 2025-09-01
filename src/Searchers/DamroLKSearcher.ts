import {Searcher} from "./Searcher.js";
import {Page} from "@playwright/test";
import {BrowserManager} from "../BrowserManager.js";
import {Extractor} from "../Extractors/Extractor.js";
import {DamroExtractor} from "../Extractors/DamroExtractor.js";
import {save_html} from "../utils/file-utils.js";
import {DamroLKExtractor} from "../Extractors/DamroLKExtractor.js";

class DamroLKSearcher extends Searcher {
    constructor(queries: string[]) {
        super(queries, "Damro");
    }
    
    async doSearch(query: string): Promise<string[]> {
        const browser = await BrowserManager.getBrowser("damro")
        
        const encodedQuery = encodeURIComponent(query);
        let searchUrl = `https://damro.lk/?s=${encodedQuery}&post_type=product`;
		console.log(`Searching Damro for query: ${searchUrl}`);
        let productUrls = new Set<string>();
        while (true) {
            const page = await browser.newPage();
            await page.goto(searchUrl);
            await page.waitForLoadState("load", {timeout: 60000});
            
            
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
        await page.waitForLoadState("load");
        
        const productWrappers = await page.$$(".product-wrapper a");
        const productUrls: string[] = [];
        for (const wrapper of productWrappers) {
            const url = await wrapper.getAttribute("href");
            if (url && url.startsWith("https://damro.lk/product/")) {
                productUrls.push(url);
            }
        }
        
        return productUrls;
    }
    
    async getNextPageUrl(page: Page): Promise<null | string> {
        const nextPageButton = await page.$("a.next.page-numbers");
        const url = await nextPageButton?.getAttribute("href");
        if (url) {
            return url
        }
        return null
    }
    
    getExtractor(url: string): Extractor {
        return new DamroLKExtractor(url);
    }
}

export {DamroLKSearcher};
