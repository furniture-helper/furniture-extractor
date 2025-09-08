import {Product} from "../Product.js";
import FileUploader from "../FileUploader.js";
import {BrowserManager} from "../BrowserManager.js";
import {save_html} from "../utils/file-utils.js";
import {Statistics} from "../Statistics.js";
import {Page} from "@playwright/test";

abstract class Extractor {
    protected readonly url: string;

    public constructor(url: string) {
        this.url = url;
    }

    abstract get vendor(): string;

    abstract get titleIndicators(): string[]

    abstract get priceIndicators(): string[]

    abstract get imageIndicator(): string

    async extract(): Promise<Product> {
        console.debug(`Extracting product data from ${this.url}...`);

        let retries = 3
        while (retries > 0) {
            try {
                const product = await this.doExtract();
                console.debug(`Extracted product: ${product}`);
                return product
            } catch (error) {
                retries -= 1;
                await new Promise(res => setTimeout(res, 1000));
                console.warn(`Error extracting product for ${this.url}:`, error);
            }
        }
        Statistics.recordError()
        throw new Error(`Failed to extract product data from ${this.url} after ${retries} attempts`);
    };

    protected async getPrice(page: Page): Promise<number> {
        const pricePromises = this.priceIndicators.map((indicator) => page.textContent(indicator, {timeout: 1000}).catch(() => null));
        let priceString = await Promise.race(pricePromises);
        return this.parsePrice(priceString || "");
    }

    protected async parsePrice(priceString: string): Promise<number> {
        if (priceString && priceString.includes("Rs")) priceString = priceString.split("Rs")[1]
        const cleaned = (priceString?.replace(/[^\d.]/g, "") || "")
            .replace(/^[.]+|[.]+$/g, "");
        const segments = cleaned.split(".");
        const normalized = segments.length > 1
            ? `${segments[0]}.${segments[1]}`
            : segments[0];
        const price = parseFloat(normalized);
        // if (!price) throw new Error(`Price not found or invalid using indicators: ${this.priceIndicators.join(", ")}`);
        if (!price || isNaN(price) || price <= 0) {
            console.warn(`Could not find price at ${this.url} using indicators: ${this.priceIndicators.join(", ")}. Setting to 0`);
            return 0;
        }

        return price;
    }

    private async doExtract(): Promise<Product> {
        const browser = await BrowserManager.getBrowser(this.vendor)
        const page = await browser.newPage();

        try {
            await page.goto(this.url, {timeout: 60000, waitUntil: "load"});

            const titlePromises = this.titleIndicators.map((indicator) => page.textContent(indicator));
            const title = await Promise.race(titlePromises);
            if (!title) throw new Error(`Title not found using indicators: ${this.titleIndicators.join(", ")}`);

            const price = await this.getPrice(page);

            const productImageUrl = await page.getAttribute(this.imageIndicator, 'src') || "";

            const pageContent = await page.content();
            const siteRoot = new URL(this.url).origin;
            const updatedContent = pageContent.replace(/(href|src)="\/([^"]*)"/g, `$1="${siteRoot}/$2"`);

            return await this.createProduct(title, price, productImageUrl, updatedContent);
        } catch (error) {
            const content_html = await page.content();
            save_html(content_html, `${this.url.split("/").pop()}.html`)
            console.warn(`Error extracting data from ${this.url}, saved HTML for debugging.`);
            throw error;
        } finally {
            await page.close();
        }
    }

    private async createProduct(title: string, price: number, productImageUrl: string, pageContent: string): Promise<Product> {
        const fileUploader = new FileUploader(this.url, pageContent)
        const pageContentUrl = await fileUploader.uploadFile()
        return new Product(title, price, this.url, this.vendor, productImageUrl, pageContentUrl)
    }
}

export {Extractor};
