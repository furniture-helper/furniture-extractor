class Statistics {

    private static productsFetched: number = 0
    private static productsProcessed: number = 0
    private static productsAdded: number = 0
    private static newProductsAddedToSheet: number = 0
    private static productsUpdatedOnSheet: number = 0
    private static errors: number = 0

    static recordProductFetched(count: number) {
        this.productsFetched += count;
    }

    static recordProductProcessed() {
        this.productsProcessed++;
    }

    static recordProductAdded() {
        this.productsAdded++;
    }

    static recordNewProductAddedToSheet() {
        this.newProductsAddedToSheet++
    }

    static recordProductUpdatedOnSheet() {
        this.productsUpdatedOnSheet++
    }

    static recordError() {
        this.errors++
    }

    static printStatistics() {
        console.log(`Products fetched = ${this.productsFetched}`)
        console.log(`Products processed = ${this.productsProcessed}`)
        console.log(`Products added = ${this.productsAdded}`)
        console.log(`Products added to sheet = ${this.newProductsAddedToSheet}`)
        console.log(`Products updated on sheet = ${this.productsUpdatedOnSheet}`)
        console.log(`Errors = ${this.errors}`)
    }

    static printProgress() {
        console.log(`${this.productsProcessed}/${this.productsFetched} processed. (Errors = ${this.errors})`)
    }

}

export {Statistics}