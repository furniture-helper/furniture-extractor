import * as fs from 'fs';
import {fetchProducts} from './fetch.js';

console.debug = () => {
};

const data = fs.readFileSync('./queries.json', 'utf-8');
const queries = JSON.parse(data);

let exit_code = 0;

for (const query of queries) {
    console.log(query);
    
    try {
        await fetchProducts(query['category'], query['queries'], {
            lower: query['lower'] || 0,
            upper: query['upper'] || 1000000
        });
    } catch (error) {
        console.error(`Error processing query "${query['query']}":`, error);
        exit_code = 1;
    }
}

process.exit(exit_code);