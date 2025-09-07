import {Extractor} from "./Extractor.js";

export default class MySoftlogicExtractor extends Extractor {

    get vendor(): string {
        return "Softlogic";
    }

    get imageIndicator(): string {
        return "img.product_image_selected";
    }

    get priceIndicators(): string[] {
        return ["#product-promotion-price"];
    }

    get titleIndicators(): string[] {
        return [".product_name"];
    }
}