import {Searcher} from "./Searcher.js";
import {Page} from "@playwright/test";
import {BrowserManager} from "../BrowserManager.js";
import {ElementHandle} from "playwright-core";
import {Extractor} from "../Extractors/Extractor.js";
import {AbansExtractor} from "../Extractors/AbansExtractor.js";
import {DamroOnlineExtractor} from "../Extractors/DamroOnlineExtractor.js";
import {DamroLKExtractor} from "../Extractors/DamroLKExtractor.js";

export class DamroLKSearcher extends Searcher {
	
    get vendor(): string {
        return "Damro";
    }
	
    get searchUrlPrefix(): string {
        return "https://damro.lk/?s="
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
        return ".product-wrapper .thumbnail-wrapper a"
    }
	
    get productUrlPrefix(): string {
        return "https://damro.lk/product/"
    }
	
    get nextPageIndicator(): string {
        return(".next.page-numbers");
    }
	
    getExtractor(url: string): Extractor {
        return new DamroLKExtractor(url);
    }

    protected waitForNetworkIdle(): boolean {
        return false;
    }
}