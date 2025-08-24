import {Extractor} from "./Extractor.js";
import {Product} from "../Product.js";
import {BrowserManager} from "../BrowserManager.js";

class AbansExtractor extends Extractor {
    
    constructor(url: string) {
        super(url, "Abans");
    }
    
    async doExtract(retries = 2): Promise<Product> {
        const browser = await BrowserManager.getBrowser("abans")
        const page = await browser.newPage();
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
    }
}

export {AbansExtractor};
