import {Extractor} from "./Extractor.js";

export default class DamroLKExtractor extends Extractor {

    get vendor(): string {
        return "Damro.lk";
    }

    get imageIndicator(): string {
        return "img.iconic-woothumbs-images__image";
    }

    get priceIndicators(): string[] {
        return [".product-inside-cash-price-new", ".product-inside-cash-price", ".product-name-colom span", "table.table.table-striped > tbody > tr > td:has-text('Rs.')"];
    }

    get titleIndicators(): string[] {
        return [".product-inside-pro-name-new", ".product-inside-pro-name"];
    }

    // protected async getPrice(page: Page): Promise<number> {
    //     if (!await this.hasTable(page)) {
    //         return super.getPrice(page);
    //     }
    //
    //     const selector = "table.table.table-striped > tbody > tr > td:has-text('Rs.')";
    //     const priceElement = await page.$(selector);
    //     if (!priceElement) {
    //         throw new Error(`Price element not found using table selector: ${selector}`);
    //     }
    //     const priceString = await priceElement.textContent();
    //
    //     return this.parsePrice(priceString || "")
    // }
    //
    // private async hasTable(page: Page) {
    //     const selector = "table.table.table-striped";
    //     const tableElement = await page.$(selector);
    //     return tableElement !== null;
    // }

}