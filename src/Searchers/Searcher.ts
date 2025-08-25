import {Extractor} from "../Extractors/Extractor.js";
import {Statistics} from "../Statistics.js";

abstract class Searcher {
    protected query: string;
    private readonly vendor;
    
    protected constructor(query: string, vendor: string) {
        this.query = query;
        this.vendor = vendor;
    }
    
    async search(): Promise<string[]> {
        console.log(`Searching for "${this.query}" at ${this.vendor}...`);
        let retries = 3
        while (retries > 0) {
            try {
                const productUrls = await this.doSearch();
                console.log(`Found ${productUrls.length} products for query "${this.query}" at ${this.vendor}`);
                Statistics.recordProductFetched(productUrls.length)
                return productUrls;
            } catch (error) {
                retries -= 1;
                await new Promise(res => setTimeout(res, 5000));
                console.warn(`Error searching for "${this.query}" at ${this.vendor}:`, error);
            }
        }
        console.error(`Failed to search for "${this.query}" at ${this.vendor} after multiple attempts`);
        return [];
    }
    
    abstract getExtractor(url: string): Extractor
    
    protected abstract doSearch(): Promise<string[]>;
}

export {Searcher};
