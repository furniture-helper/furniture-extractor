import {Extractor} from "./Extractor.js";
import {Product} from "../Product.js";
import {BrowserManager} from "../BrowserManager.js";
import {save_html} from "../utils/file-utils.js";

class SingerExtractor extends Extractor {
    
    constructor(url: string) {
        super(url, "Singer");
    }
    
    async doExtract(): Promise<Product> {
        const browser = await BrowserManager.getBrowser("singer")
        const page = await browser.newPage();
        try {
            await page.goto(this.url, {timeout: 60000, waitUntil: "load"});
            const title = await page.textContent('.single-page-product-title', {timeout: 60000});
            if (!title) {
                throw new Error("Unable to extract title");
            }
            
            const priceSelector = await page.$('.productprice') ? '.productprice' : '.sing-pro-price';
            const priceString = await page.textContent(priceSelector, {timeout: 60000})
            if (!priceString) {
                throw new Error("Unable to extract price");
            }
			
            let price: number;
            try {
                price = parseFloat(priceString?.replace("Rs.", "").replace(/,/g, "").trim() || "");
            } catch (e) {
                throw new Error("Unable to parse price");
            }
			
			const productImageUrl = await page.getAttribute('#mainProductImage', 'src') || "";
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

export {SingerExtractor};
