import {Extractor} from "./Extractor.js";

export default class DamroOnlineExtractor extends Extractor {

    get vendor(): string {
        return "Damro";
    }

    get imageIndicator(): string {
        return ".woocommerce-main-image img";
    }

    get priceIndicators(): string[] {
        return [".price .woocommerce-Price-amount:not(del .woocommerce-Price-amount)"];
    }

    get titleIndicators(): string[] {
        return [".product-inside-pro-name"];
    }
}