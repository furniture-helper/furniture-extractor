import {Extractor} from "./Extractor.js";
import {Product} from "../Product.js";
import {BrowserManager} from "../BrowserManager.js";
import {save_html} from "../utils/file-utils.js";

class SinghagiriExtractor extends Extractor {
    
    constructor(url: string) {
        super(url, "Singhagiri");
    }
    
    async doExtract(): Promise<Product> {
        const browser = await BrowserManager.getBrowser("singer")
        const page = await browser.newPage();
        try {
            await page.goto(this.url, {timeout: 60000, waitUntil: "load"});
            const title = await page.textContent('.product-title', {timeout: 60000});
            if (!title) {
                throw new Error("Unable to extract title");
            }
            
            const priceString = await page.textContent('.selling-price .data', {timeout: 60000})
            if (!priceString) {
                throw new Error("Unable to extract price");
            }
			
            let price: number;
            try {
                price = parseFloat(priceString?.replace("Rs.", "").replace(/,/g, "").trim() || "");
            } catch (e) {
                throw new Error("Unable to parse price");
            }
			
			const productImageUrl = await page.getAttribute('.product-slider__main-slider__item img', 'src') || "";
			const pageContent = await page.content();
            
            return await this.createProduct(title, price, productImageUrl, pageContent);
            
        } catch (error) {
            const content_html = await page.content();
            save_html(content_html, `${this.url.split("/").pop()}.html`)
            console.warn(`Error extracting data from ${this.url}, saved HTML for debugging.`);
            throw error;
        } finally {
	        await page.close();
        }
    }
}

export {SinghagiriExtractor};
