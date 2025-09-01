import {Searcher} from "./Searcher.js";
import {Extractor} from "../Extractors/Extractor.js";
import {SinghagiriExtractor} from "../Extractors/SinghagiriExtractor.js";

export class SinghagiriSearcher extends Searcher {

    get vendor(): string {
        return "Singhagiri";
    }

    get searchUrlPrefix(): string {
        return "https://singhagiri.lk/filter?search="
    }

    get searchUrlSuffix(): string {
        return ""
    }

    get noResultsIndicator(): string {
        return ".no-results"
    }

    get searchResultsContainerIndicator(): string {
        return ".product"
    }

    get productLinkIndicator(): string {
        return ".product .product_title a"
    }

    get productUrlPrefix(): string {
        return "https://singhagiri.lk/product/"
    }

    get nextPageIndicator(): string {
        return ("a[rel='next']");
    }

    getExtractor(url: string): Extractor {
        return new SinghagiriExtractor(url);
    }
}