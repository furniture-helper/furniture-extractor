import {GoogleSheetsOperator} from "./GoogleSheetsOperator.js";
import {Product} from "./Product.js";
import {recordsToCsv} from "./utils/file-utils.js";
import {ProcessQueue} from "./ProcessQueue.js";
import {BrowserManager} from "./BrowserManager.js";
import {Statistics} from "./Statistics.js";
import {Searcher} from "./Searchers/Searcher.js";
import {SingerSearcher} from "./Searchers/SingerSearcher.js";
import {AbansSearcher} from "./Searchers/AbansSearcher.js";
import {DamroSearcher} from "./Searchers/DamroSearcher.js";
import {SinghagiriSearcher} from "./Searchers/SinghagiriSearcher.js";
import minimist from "minimist";

// console.debug = () => {
// };

const products: Product[] = [];

const args = minimist(process.argv.slice(2));
const query = args['query']
const price_range = {
    lower: args['lower'] || 0,
    upper: args['upper'] || 1000000
}

const searchers: Searcher[] = [
    new SingerSearcher(query),
    new AbansSearcher(query),
    new DamroSearcher(query),
    new SinghagiriSearcher(query),
]

const promises: Promise<void>[] = [];
for (const searcher of searchers) {
    promises.push(searchAndExtract(searcher, products, price_range));
}
await Promise.all(promises);

const productsRecords = products.map(p => p.toRecord())
productsRecords.sort((a, b) => a.price - b.price)
recordsToCsv(productsRecords, `${query.replace(" ", "-").toLowerCase()}.csv`)

await BrowserManager.closeAllBrowsers()
Statistics.printStatistics()
process.exit(0)


async function searchAndExtract(searcher: Searcher, products: Product[], price_range: {
    lower: number,
    upper: number
}) {
    const productUrls = await searcher.search()
    
    const processQueue = new ProcessQueue(1)
    for (const url of productUrls) {
        processQueue.addTask(async () => {
            const extractor = searcher.getExtractor(url)
            const product = await extractor.extract()
            if (product.getPrice() >= price_range.lower && product.getPrice() <= price_range.upper) {
                products.push(product)
                await GoogleSheetsOperator.addOrUpdateProduct(product, query)
                
                Statistics.recordProductAdded()
                console.log(`Added product: ${product}`);
            }
            Statistics.recordProductProcessed()
            Statistics.printProgress()
        });
    }
    await processQueue.run()
}
