import {Extractor} from "./Extractor.js";

export default class AbansExtractor extends Extractor {

    get vendor(): string {
        return "Abans";
    }

    get imageIndicator(): string {
        return ".exzoom_img_ul li img";
    }

    get priceIndicators(): string[] {
        return [".selling-price-de"];
    }

    get titleIndicators(): string[] {
        return [".product-title"];
    }


}