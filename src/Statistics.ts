import {GoogleSheetsOperator} from "./Operators/GoogleSheetsOperator.js";

export type DailyStatisticsRecord = {
    date: string,
    vendor: string,
    category: string,
    productsFetched: number,
    productsProcessed: number,
    productsAdded: number,
    newProductsAddedToSheet: number,
    productsUpdatedOnSheet: number,
}

class Statistics {

    private static productsFetched: number = 0
    private static productsProcessed: number = 0
    private static productsAdded: number = 0
    private static newProductsAddedToSheet: number = 0
    private static productsUpdatedOnSheet: number = 0
    private static errors: number = 0
    private static dailyStatistics: DailyStatisticsRecord[] = []

    static recordProductFetched(vendor: string, category: string, count: number) {
        this.productsFetched += count;
        this.getDailyStatisticsRecord(vendor, category).productsFetched += count;
    }

    static recordProductProcessed(vendor: string, category: string) {
        this.productsProcessed++;
        this.getDailyStatisticsRecord(vendor, category).productsProcessed++;
    }

    static recordProductAdded(vendor: string, category: string) {
        this.productsAdded++;
        this.getDailyStatisticsRecord(vendor, category).productsAdded++;
    }

    static recordNewProductAddedToSheet(vendor: string, category: string) {
        this.newProductsAddedToSheet++
        this.getDailyStatisticsRecord(vendor, category).newProductsAddedToSheet++;
    }

    static recordProductUpdatedOnSheet(vendor: string, category: string) {
        this.productsUpdatedOnSheet++
        this.getDailyStatisticsRecord(vendor, category).productsUpdatedOnSheet++;
    }

    static recordError() {
        this.errors++
    }

    static async printStatistics() {
        console.log(`Products fetched = ${this.productsFetched}`)
        console.log(`Products processed = ${this.productsProcessed}`)
        console.log(`Products added = ${this.productsAdded}`)
        console.log(`Products added to sheet = ${this.newProductsAddedToSheet}`)
        console.log(`Products updated on sheet = ${this.productsUpdatedOnSheet}`)
        console.log(`Errors = ${this.errors}`)

        console.table(this.dailyStatistics)
        try {
            await GoogleSheetsOperator.addDailyStatistics(this.dailyStatistics)
        } catch (error) {
            console.error("Failed to add daily statistics to Google Sheets:", error);
        }
    }

    static printProgress() {
        console.log(`${this.productsProcessed}/${this.productsFetched} processed. (Errors = ${this.errors})`)
    }

    public static reset() {
        this.productsFetched = 0
        this.productsProcessed = 0
        this.productsAdded = 0
        this.newProductsAddedToSheet = 0
        this.productsUpdatedOnSheet = 0
        this.errors = 0
        this.dailyStatistics = []
    }

    private static getDailyStatisticsRecord(vendor: string, category: string): DailyStatisticsRecord {
        const today = new Date().toISOString().split('T')[0];
        let record = this.dailyStatistics.find(r => r.date === today && r.vendor === vendor && r.category === category);
        if (!record) {
            record = {
                date: today,
                vendor: vendor,
                category: category,
                productsFetched: 0,
                productsProcessed: 0,
                productsAdded: 0,
                newProductsAddedToSheet: 0,
                productsUpdatedOnSheet: 0,
            };
            this.dailyStatistics.push(record);
        }
        return record;
    }

}

export {Statistics}