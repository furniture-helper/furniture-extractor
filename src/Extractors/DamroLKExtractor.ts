import {Extractor} from "./Extractor.js";

export default class DamroLKExtractor extends Extractor {

    get vendor(): string {
        return "Damro";
    }

    get imageIndicator(): string {
        return "img.iconic-woothumbs-images__image";
    }

    get priceIndicators(): string[] {
        return [".product-inside-cash-price-new", ".product-inside-cash-price"];
    }

    get titleIndicators(): string[] {
        return [".product-inside-pro-name-new", ".product-inside-pro-name"];
    }


}