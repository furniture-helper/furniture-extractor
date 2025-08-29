import {Product} from "../Product.js";
import FileUploader from "../FileUploader.js";

abstract class Extractor {
    protected readonly url: string;
    private readonly vendor: string;
    
    protected constructor(url: string, vendor: string) {
        this.url = url;
        this.vendor = vendor;
    }
    
    abstract doExtract(): Promise<Product>
    
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
                await new Promise(res => setTimeout(res, 5000));
                console.warn(`Error extracting product for ${this.url}:`, error);
            }
        }
        throw new Error(`Failed to extract product data from ${this.url} after ${retries} attempts`);
    };
    
    protected async createProduct(title: string, price: number, productImageUrl: string, pageContent: string): Promise<Product> {
		const fileUploader = new FileUploader(this.url, pageContent)
	    const pageContentUrl = await fileUploader.uploadFile()
        return new Product(title, price, this.url, this.vendor, productImageUrl, pageContentUrl)
    }
}

export {Extractor};
