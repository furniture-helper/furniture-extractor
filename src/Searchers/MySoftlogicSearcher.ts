import {Searcher} from "./Searcher.js";
import {Extractor} from "../Extractors/Extractor.js";
import MySoftlogicExtractor from "../Extractors/MySoftlogicExtractor.js";

export default class MySoftlogicSearcher extends Searcher {

    get vendor(): string {
        return "Softlogic";
    }

    get searchUrlPrefix(): string {
        return "https://mysoftlogic.lk/search?search-text="
    }

    get searchUrlSuffix(): string {
        return ""
    }

    get noResultsIndicator(): string {
        return ".empty_search_title"
    }

    get searchResultsContainerIndicator(): string {
        return "#itemContainer"
    }

    get productLinkIndicator(): string {
        return ".product_item > a"
    }

    get productUrlPrefix(): string {
        return "/"
    }

    get nextPageIndicator(): string {
        return (".page_nav a.next");
    }

    getExtractor(url: string): Extractor {
        return new MySoftlogicExtractor(url);
    }
}