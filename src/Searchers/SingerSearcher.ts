import {Searcher} from "./Searcher.js";
import {Extractor} from "../Extractors/Extractor.js";
import {SingerExtractor} from "../Extractors/SingerExtractor.js";

export class SingerSearcher extends Searcher {

    get vendor(): string {
        return "Singer";
    }

    get searchUrlPrefix(): string {
        return "https://www.singersl.com/filter?category_id=&search="
    }

    get searchUrlSuffix(): string {
        return ""
    }

    get noResultsIndicator(): string {
        return ".no-results"
    }

    get searchResultsContainerIndicator(): string {
        return ".productfilter"
    }

    get productLinkIndicator(): string {
        return ".card-title.product__name a"
    }

    get productUrlPrefix(): string {
        return "https://www.singersl.com/product/"
    }

    get nextPageIndicator(): string {
        return ("a[rel='next']");
    }

    getExtractor(url: string): Extractor {
        return new SingerExtractor(url);
    }
}