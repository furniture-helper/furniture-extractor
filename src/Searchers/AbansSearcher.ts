import {Searcher} from "./Searcher.js";
import {Page} from "@playwright/test";
import {BrowserManager} from "../BrowserManager.js";
import {ElementHandle} from "playwright-core";
import {Extractor} from "../Extractors/Extractor.js";
import {AbansExtractor} from "../Extractors/AbansExtractor.js";

class AbansSearcher extends Searcher {
    constructor(query: string) {
        super(query, "Abans");
    }
    
    async doSearch(): Promise<string[]> {
        const encodedQuery = encodeURIComponent(this.query);
        const searchUrl = `https://buyabans.com/search/show?query=${encodedQuery}`;
        
        const browser = await BrowserManager.getBrowser("abans")
        const page = await browser.newPage();
        await page.goto(searchUrl);
        await page.waitForLoadState("networkidle");
        
        let productUrls = new Set<string>();
        while (true) {
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
                console.debug(`Found a next page button, navigating to next page...`);
                await nextPageButton.click();
                await new Promise(resolve => setTimeout(resolve, 5000));
            } else {
                break
            }
        }
        
        
        await page.close();
        return [...new Set(productUrls)];
    }
    
    async getListItems(page: Page): Promise<string[]> {
        await page.waitForLoadState("networkidle");
        await page.waitForSelector(".product-list-item", {timeout: 60000});
        const productListItems = await page.$$(".product-list-item");
        
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
    
    async getNextPageButton(page: Page): Promise<null | ElementHandle<SVGElement | HTMLElement>> {
        const pagination = await page.$(".pagination");
        if (!pagination) {
            console.debug("No pagination found");
            return null;
        }
        
        const pageItemButtons = await pagination.$$(".page-item");
        for (const button of pageItemButtons) {
            const text = await button.innerText();
            if (text.trim() === "Next »") {
                console.debug(`Found pagination button with text: ${text}`);
                return button;
            }
        }
        return null;
    }
    
    getExtractor(url: string): Extractor {
        return new AbansExtractor(url);
    }
}

export {AbansSearcher};
