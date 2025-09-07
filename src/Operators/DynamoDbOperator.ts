import Operator from "./Operator.js";
import {Statistics} from "../Statistics.js";
import {Product} from "../Product.js";
import {DynamoDBClient, PutItemCommand} from "@aws-sdk/client-dynamodb";

export default class DynamoDbOperator extends Operator {

    private static readonly tableName = "FurnitureHelperProducts";
    private static readonly client = new DynamoDBClient({region: process.env.AWS_REGION});

    public async addOrUpdateProduct(product: Product, category: string): Promise<void> {
        const params = {
            TableName: DynamoDbOperator.tableName,
            Item: {
                "listingUrl-category": {S: `${product.getListingUrl()}-${category}`},
                "title": {S: product.getTitle()},
                "brand": {S: product.getBrand()},
                "vendor": {S: product.getVendor()},
                "category": {S: category},
                "price": {N: product.getPrice().toString()},
                "listingUrl": {S: product.getListingUrl()},
                "productImageUrl": {S: product.getProductImageUrl()},
                "pageContentUrl": {S: product.getPageContentUrl()}
            }
        }

        await DynamoDbOperator.client.send(new PutItemCommand(params));
        console.debug(`Added/Updated product in DynamoDB: ${product}`);
        Statistics.recordNewProductAddedToSheet();
    }
}