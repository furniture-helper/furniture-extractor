import {Extractor} from "./Extractor.js";
import {Product} from "../Product.js";
import {BrowserManager} from "../BrowserManager.js";
import {save_html} from "../utils/file-utils.js";

class AbansExtractor extends Extractor {
    
    constructor(url: string) {
        super(url, "Abans");
    }
    
    async doExtract(): Promise<Product> {
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
            
            
            await page.close()
            return this.createProduct(title, price)
            
        } catch (error) {
            const content_html = await page.content();
            await page.close()
            save_html(content_html, `${this.url.split("/").pop()}.html`)
            console.warn(`Error extracting data from ${this.url}, saved HTML for debugging.`);
            throw error;
        }
    }
}

export {AbansExtractor};
