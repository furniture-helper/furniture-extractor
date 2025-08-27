import {Extractor} from "../Extractors/Extractor.js";
import {Statistics} from "../Statistics.js";

abstract class Searcher {
    protected queries: string[];
    private readonly vendor;
    
    protected constructor(queries: string[], vendor: string) {
        this.queries = queries;
        this.vendor = vendor;
    }
    
    async search(): Promise<string[]> {
        const allProductUrls: string[] = [];
        
        for (const query of this.queries) {
            console.log(`Searching for "${query}" at ${this.vendor}...`);
            
            let retries = 3
            while (retries > 0) {
                try {
                    const productUrls = await this.doSearch(query);
                    console.log(`Found ${productUrls.length} products for query "${query}" at ${this.vendor}`);
                    Statistics.recordProductFetched(productUrls.length)
                    allProductUrls.push(...productUrls);
                    break
                } catch (error) {
                    retries -= 1;
                    await new Promise(res => setTimeout(res, 5000));
                    console.warn(`Warning: error while searching for "${query}" at ${this.vendor}:`, error);
                }
            }
        }
        
        return [...new Set(allProductUrls)];
    }
    
    abstract getExtractor(url: string): Extractor
    
    protected abstract doSearch(query: string): Promise<string[]>;
}

export {Searcher};
