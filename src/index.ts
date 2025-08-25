import {Product} from "./Product.js";
import {Searcher} from "./Searchers/Searcher.js";
import {BrowserManager} from "./BrowserManager.js";
import {recordsToCsv} from "./utils/file-utils.js";
import {DamroSearcher} from "./Searchers/DamroSearcher.js";
import {AbansSearcher} from "./Searchers/AbansSearcher.js";
import {SingerSearcher} from "./Searchers/SingerSearcher.js";
import {ProcessQueue} from "./ProcessQueue.js";

console.debug = () => {
};
const products: Product[] = [];

const query = "pressure washer"
const price_range = {
    lower: 10000,
    upper: 1500000
}

const searchers: Searcher[] = [
    new SingerSearcher(query),
    new AbansSearcher(query),
    new DamroSearcher(query),
]

const promises: Promise<void>[] = [];
for (const searcher of searchers) {
    promises.push(searchAndExtract(searcher, products, price_range));
}
await Promise.all(promises);

const productsRecords = products.map(p => p.toRecord())
recordsToCsv(productsRecords, `${query.replace(" ", "-").toLowerCase()}.csv`)

await BrowserManager.closeAllBrowsers()
process.exit(0)


async function searchAndExtract(searcher: Searcher, products: Product[], price_range: {
    lower: number,
    upper: number
}) {
    const productUrls = await searcher.search()
    
    const processQueue = new ProcessQueue(3)
    for (const url of productUrls) {
        processQueue.addTask(async () => {
            const extractor = searcher.getExtractor(url)
            const product = await extractor.extract()
            if (product.getPrice() >= price_range.lower && product.getPrice() <= price_range.upper) {
                products.push(product)
                console.log(`Added product: ${product}`);
            }
        });
    }
    await processQueue.run()
}
