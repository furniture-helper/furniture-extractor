import {Searcher} from "./Searcher.js";
import {Page} from "@playwright/test";
import {BrowserManager} from "../BrowserManager.js";
import {Extractor} from "../Extractors/Extractor.js";
import {SingerExtractor} from "../Extractors/SingerExtractor.js";

class SingerSearcher extends Searcher {
    constructor(query: string) {
        super(query, "Singer");
    }
    
    async doSearch(): Promise<string[]> {
        const encodedQuery = encodeURIComponent(this.query);
        const browser = await BrowserManager.getBrowser("singer")
        const page = await browser.newPage();
        
        let productUrls = new Set<string>();
        let pageNo = 1
        while (true) {
            const searchUrl = `https://www.singersl.com/filter?category_id=&search=${encodedQuery}&page=${pageNo}`;
            
            await page.goto(searchUrl);
            await page.waitForLoadState("networkidle");
            const initialSize = productUrls.size;
            
            const newUrls = await this.getListItems(page);
            for (const url of newUrls) {
                productUrls.add(url);
            }
            
            if (productUrls.size === initialSize) {
                console.debug("No new items were found, stopping pagination.");
                break;
            }
            
            if (!await this.hasNextPage(page)) {
                console.debug("No next page button found, stopping pagination.");
                break;
            }
            
            pageNo += 1;
        }
        
        await page.close();
        return [...new Set(productUrls)];
    }
    
    async getListItems(page: Page): Promise<string[]> {
        await page.waitForLoadState("networkidle");
        await page.waitForSelector(".productFilter", {timeout: 60000});
        const productListItems = await page.$$(".productFilter");
        
        const productUrls: string[] = [];
        for (const item of productListItems) {
            const linkElement = await item.$("a");
            if (linkElement) {
                const href = await linkElement.getAttribute("href");
                if (href && href.startsWith("https://")) {
                    console.debug("Extracted URL:", href);
                    productUrls.push(href);
                }
            }
        }
        
        return productUrls;
    }
    
    async hasNextPage(page: Page): Promise<boolean> {
        const pagination = await page.$(".pagination");
        if (!pagination) {
            return false;
        }
        const nextButton = await pagination.$("a[rel='next']");
        return nextButton !== null;
    }
    
    getExtractor(url: string): Extractor {
        return new SingerExtractor(url);
    }
    
}

export {SingerSearcher};
