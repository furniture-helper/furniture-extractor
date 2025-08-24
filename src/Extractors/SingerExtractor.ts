import {Extractor} from "./Extractor.js";
import {Product} from "../Product.js";
import {BrowserManager} from "../BrowserManager.js";

class SingerExtractor extends Extractor {
    
    constructor(url: string) {
        super(url, "Singer");
    }
    
    async doExtract(): Promise<Product> {
        const browser = await BrowserManager.getBrowser("singer")
        const page = await browser.newPage();
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

export {SingerExtractor};
