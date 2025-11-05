import {Searcher} from "./Searcher.js";
import {Extractor} from "../Extractors/Extractor.js";
import DamroLKExtractor from "../Extractors/DamroLKExtractor.js"

export default class DamroLKSearcher extends Searcher {

    get vendor(): string {
        return "Damro.lk";
    }

    get searchUrlPrefix(): string {
        return "https://www.damro.lk/filter?search="
    }

    get searchUrlSuffix(): string {
        return ""
    }

    get noResultsIndicator(): string {
        return ".no-results"
    }

    get searchResultsContainerIndicator(): string {
        return ".product-grid-item"
    }

    get productLinkIndicator(): string {
        return ".product-grid-item .product-element-top a"
    }

    get productUrlPrefix(): string {
        return "https://www.damro.lk/product/"
    }

    get nextPageIndicator(): string {
        return ("a[rel='next']");
    }

    getExtractor(url: string): Extractor {
        return new DamroLKExtractor(url);
    }

    protected waitForNetworkIdle(): boolean {
        return false;
    }
}