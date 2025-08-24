import {Extractor} from "../Extractors/Extractor.js";

abstract class Searcher {
    protected query: string;
    private readonly vendor;
    
    protected constructor(query: string, vendor: string) {
        this.query = query;
        this.vendor = vendor;
    }
    
    async search(): Promise<string[]> {
        console.log(`Searching for "${this.query}" at ${this.vendor}...`);
        const productUrls = await this.doSearch();
        console.log(`Found ${productUrls.length} products for query "${this.query}" at ${this.vendor}`);
        return productUrls;
    }
    
    abstract getExtractor(url: string): Extractor
    
    protected abstract doSearch(): Promise<string[]>;
}

export {Searcher};
