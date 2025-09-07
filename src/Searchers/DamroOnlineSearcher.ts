import {Searcher} from "./Searcher.js";
import {Extractor} from "../Extractors/Extractor.js";
import DamroOnlineExtractor from "../Extractors/DamroOnlineExtractor.js";

export default class DamroOnlineSearcher extends Searcher {

    get vendor(): string {
        return "Damro";
    }

    get searchUrlPrefix(): string {
        return "https://damroonline.lk/?s="
    }

    get searchUrlSuffix(): string {
        return "&post_type=product"
    }

    get noResultsIndicator(): string {
        return "#main-content #primary .woocommerce-info"
    }

    get searchResultsContainerIndicator(): string {
        return ".product-wrapper"
    }

    get productLinkIndicator(): string {
        return ".product-name a"
    }

    get productUrlPrefix(): string {
        return "https://damroonline.lk/product/"
    }

    get nextPageIndicator(): string {
        return (".next.page-numbers");
    }

    getExtractor(url: string): Extractor {
        return new DamroOnlineExtractor(url);
    }
}