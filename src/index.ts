import minimist from "minimist";
import {fetchProducts} from "./fetch.js";

console.debug = () => {
};

const args = minimist(process.argv.slice(2));
const category = args['category']
const queries = args['queries'].split(',').map((q: string) => q.trim());
const price_range = {
    lower: args['lower'] || 0,
    upper: args['upper'] || 1000000
}


await fetchProducts(category, queries, price_range);

