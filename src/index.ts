import minimist from "minimist";
import {fetchProducts} from "./fetch.js";

console.debug = () => {
};

const args = minimist(process.argv.slice(2));
const query = args['query']
const price_range = {
    lower: args['lower'] || 0,
    upper: args['upper'] || 1000000
}


await fetchProducts(query, price_range);

