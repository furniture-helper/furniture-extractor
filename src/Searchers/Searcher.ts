import {Extractor} from "../Extractors/Extractor.js";
import {Statistics} from "../Statistics.js";
import {BrowserManager} from "../BrowserManager.js";
import {Page} from "@playwright/test";
import {ElementHandle} from "playwright-core";
import {save_html} from "../utils/file-utils.js";

abstract class Searcher {
    protected queries: string[];
	abstract get vendor(): string;
	abstract get searchUrlPrefix(): string;
	abstract get searchUrlSuffix(): string;
	abstract get noResultsIndicator(): string;
	abstract get searchResultsContainerIndicator(): string;
	abstract get productLinkIndicator(): string;
	abstract get productUrlPrefix(): string;
	abstract get nextPageIndicator(): string;
	abstract getExtractor(url: string): Extractor
	
	public constructor(queries: string[]) {
        this.queries = queries;
    }
    
    public async search(): Promise<string[]> {
        const allProductUrls: string[] = [];
        
        for (const query of this.queries) {
            console.log(`Searching for "${query}" at ${this.vendor}...`);
            
            let retries = 3
            while (retries > 0) {
                try {
                    const productUrls = await this.doSearch(query);
                    console.log(`Found ${productUrls.length} products for query "${query}" at ${this.vendor}`);
                    Statistics.recordProductFetched(productUrls.length)
                    allProductUrls.push(...productUrls);
                    break
                } catch (error) {
                    retries -= 1;
                    await new Promise(res => setTimeout(res, 5000));
                    console.warn(`Warning: error while searching for "${query}" at ${this.vendor}:`, error);
                }
            }
        }
        
        return [...new Set(allProductUrls)];
    }
	
	private async doSearch(query: string): Promise<string[]> {
		const browser = await BrowserManager.getBrowser(this.vendor)
		const encodedQuery = encodeURIComponent(query);
		let searchUrl = `${this.searchUrlPrefix}${encodedQuery}${this.searchUrlSuffix}`;
		console.debug(`Navigating to search URL: ${searchUrl}`);
		
		const page = await browser.newPage();
		await page.goto(searchUrl);
		
		let productUrls = new Set<string>();
		while (true) {
			console.debug(`Navigating to next page...`);
			
			try {
				await page.waitForLoadState("load", {timeout: 60000});
				await page.waitForLoadState("networkidle", {timeout: 60000});
				
				const noResultsElement = await page.$(this.noResultsIndicator);
				if (noResultsElement) {
					const isVisible = await noResultsElement.isVisible();
					if (isVisible) {
						console.debug("No results found, stopping pagination.");
						break;
					}
				}
				
				await page.waitForSelector(this.searchResultsContainerIndicator, {timeout: 60000});
			} catch(error) {
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
		await browser.close();
		return [...new Set(productUrls)];
	}
	
	private async getListItems(page: Page): Promise<string[]> {
		const productWrappers = await page.$$(this.productLinkIndicator);
		
		const productUrls: string[] = [];
		for (const wrapper of productWrappers) {
			const url = await wrapper.getAttribute("href");
			if (url && url.startsWith(this.productUrlPrefix)) {
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
		
		return nextPageButtons[nextPageButtons.length -1]
	}
}

export {Searcher};
