import {Extractor} from "./Extractor.js";

export default class SingerExtractor extends Extractor {

    get vendor(): string {
        return "Singer";
    }

    get imageIndicator(): string {
        return "#mainProductImage";
    }

    get priceIndicators(): string[] {
        return [".sing-pro-price", ".productprice"];
    }

    get titleIndicators(): string[] {
        return [".single-page-product-title"];
    }
}