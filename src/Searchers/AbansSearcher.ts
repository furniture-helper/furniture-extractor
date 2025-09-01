import {Searcher} from "./Searcher.js";
import {Extractor} from "../Extractors/Extractor.js";
import {AbansExtractor} from "../Extractors/AbansExtractor.js";

export class AbansSearcher extends Searcher {
	
    get vendor(): string {
        return "Abans";
    }
	
    get searchUrlPrefix(): string {
        return "https://buyabans.com/search/show?query="
    }
	
    get searchUrlSuffix(): string {
        return ""
    }
	
	get noResultsIndicator(): string {
		return "#no_products_label"
	}
	
	get searchResultsContainerIndicator(): string {
		return ".product-imgage"
	}
	
    get productLinkIndicator(): string {
        return ".product-list-item a.home-buynow"
    }
	
    get productUrlPrefix(): string {
        return "https://buyabans.com/"
    }
	
    get nextPageIndicator(): string {
        return(".page-link");
    }
	
    getExtractor(url: string): Extractor {
        return new AbansExtractor(url);
    }
}