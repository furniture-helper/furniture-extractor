import {fetchProducts} from './fetch.js';
import {GetObjectCommand, S3Client} from "@aws-sdk/client-s3";
import {Readable} from "stream";

console.debug = () => {
};

const streamToString = (stream: Readable): Promise<string> =>
    new Promise((resolve, reject) => {
        const chunks: Uint8Array[] = [];
        stream.on("data", (chunk: Uint8Array) => chunks.push(chunk));
        stream.on("error", reject);
        stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    });

const data = await getQueriesJsonFromS3()
let queries = JSON.parse(data);
queries = shuffleArray(queries);

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

async function getQueriesJsonFromS3() {
    const s3Client = new S3Client({region: process.env.AWS_REGION});
    const bucket = "furniture-helper";
    const filename = "queries.json";

    const command = new GetObjectCommand({
        Bucket: bucket,
        Key: filename,
    });

    try {
        const response = await s3Client.send(command);
        if (response.Body instanceof Readable) {
            return await streamToString(response.Body);
        }
        throw new Error("Response body is not a readable stream.");
    } catch (err) {
        console.error(`Error reading file from S3:`, err);
        throw err;
    }
}

function shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}