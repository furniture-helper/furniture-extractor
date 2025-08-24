import {Product} from "../Product.js";

abstract class Extractor {
    protected url: string;
    
    protected constructor(url: string) {
        this.url = url;
    }
    
    abstract extract(): Promise<Product>;
}

export {Extractor};
