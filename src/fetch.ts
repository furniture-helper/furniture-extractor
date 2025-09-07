import {recordsToCsv} from "./utils/file-utils.js";
import {BrowserManager} from "./BrowserManager.js";
import {Statistics} from "./Statistics.js";
import {Searcher} from "./Searchers/Searcher.js";
import {Product} from "./Product.js";
import {ProcessQueue} from "./ProcessQueue.js";
import MySoftlogicSearcher from "./Searchers/MySoftlogicSearcher.js";
import AbansSearcher from "./Searchers/AbansSearcher.js";
import SingerSearcher from "./Searchers/SingerSearcher.js";
import DamroOnlineSearcher from "./Searchers/DamroOnlineSearcher.js";
import DamroLKSearcher from "./Searchers/DamroLKSearcher.js";
import SinghagiriSearcher from "./Searchers/SinghagiriSearcher.js";
import DynamoDbOperator from "./Operators/DynamoDbOperator.js";

async function fetchProducts(category: string, queries: string[], price_range: {
    lower: number,
    upper: number
}): Promise<void> {
    const products: Product[] = [];
    const searchers: Searcher[] = [
        new SingerSearcher(queries),
        new AbansSearcher(queries),
        new DamroOnlineSearcher(queries),
        new DamroLKSearcher(queries),
        new SinghagiriSearcher(queries),
        new MySoftlogicSearcher(queries)
    ]

    const promises: Promise<void>[] = [];
    for (const searcher of searchers) {
        promises.push(searchAndExtract(category, searcher, products, price_range));
    }
    await Promise.all(promises);

    const productsRecords = products.map(p => p.toRecord())
    productsRecords.sort((a, b) => a.price - b.price)
    recordsToCsv(productsRecords, `${category.replace(" ", "-").toLowerCase()}.csv`)

    await BrowserManager.closeAllBrowsers()
    Statistics.printStatistics()
}

async function searchAndExtract(category: string, searcher: Searcher, products: Product[], price_range: {
    lower: number,
    upper: number
}) {
    const productUrls = await searcher.search()

    const processQueue = new ProcessQueue(5)
    for (const url of productUrls) {
        processQueue.addTask(async () => {
            const extractor = searcher.getExtractor(url)
            const product = await extractor.extract()
            if (product.getPrice() >= price_range.lower && product.getPrice() <= price_range.upper) {
                products.push(product)
                await new DynamoDbOperator().addOrUpdateProduct(product, category)

                Statistics.recordProductAdded()
                console.log(`Added product: ${product}`);
            }
            Statistics.recordProductProcessed()
            Statistics.printProgress()
        });
    }
    await processQueue.run()
}


export {fetchProducts}