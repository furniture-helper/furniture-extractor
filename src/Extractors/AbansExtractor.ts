import {Extractor} from "./Extractor.js";
import {Product} from "../Product.js";
import {BrowserManager} from "../BrowserManager.js";
import {save_html} from "../utils/file-utils.js";

class AbansExtractor extends Extractor {
    
    constructor(url: string) {
        super(url);
    }
    
    async extract(retries = 2): Promise<Product> {
        const browser = await BrowserManager.getBrowser("abans")
        const page = await browser.newPage();
        try {
            await page.goto(this.url, {timeout: 60000, waitUntil: "load"});
            const title = await page.textContent('.product-title', {timeout: 60000});
            if (!title) {
                throw new Error("Unable to extract title");
            }
            
            const priceString = await page.textContent('.selling-price-de', {timeout: 60000});
            if (!priceString) {
                throw new Error("Unable to extract price");
            }
            
            await page.close()
            
            let price: number;
            try {
                price = parseFloat(priceString?.replace("Rs.", "").replace(/,/g, "").trim() || "");
            } catch (e) {
                throw new Error("Unable to parse price");
            }
            
            const listingUrl = this.url;
            const vendor = "Abans";
            
            console.debug(`Extracted product: ${title} - ${price}`);
            return new Product(title, price, listingUrl, vendor);
            
        } catch (error) {
            console.warn(`Error extracting product for ${this.url}:`, error);
            save_html(await page.content(), `${this.url.split("/").pop()}.html`);
            await page.close();
            if (retries > 0) {
                console.warn(`Retrying ${this.url} (${retries} attempts left)`);
                await new Promise(resolve => setTimeout(resolve, 5000));
                return this.extract(retries - 1);
            }
            throw new Error(`Failed to load page ${this.url}: ${error}`);
        } finally {
            await page.close();
        }
        
    }
}

export {AbansExtractor};
