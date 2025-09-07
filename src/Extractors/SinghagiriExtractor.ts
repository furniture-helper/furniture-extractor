import {Extractor} from "./Extractor.js";

export default class SinghagiriExtractor extends Extractor {

    get vendor(): string {
        return "Singhagiri";
    }

    get imageIndicator(): string {
        return ".product-slider__main-slider__item img";
    }

    get priceIndicators(): string[] {
        return [".selling-price .data"];
    }

    get titleIndicators(): string[] {
        return [".product-title"];
    }
}