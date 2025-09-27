import Operator from "./Operator.js";
import {Statistics} from "../Statistics.js";
import {Product} from "../Product.js";
import {DynamoDBClient, GetItemCommand, PutItemCommand} from "@aws-sdk/client-dynamodb";

export default class DynamoDbOperator extends Operator {

    private static readonly tableName = "FurnitureHelperProducts";
    private static readonly client = new DynamoDBClient({region: process.env.AWS_REGION});

    public async addOrUpdateProduct(product: Product, category: string): Promise<void> {
        const [existingProduct, existingConsideration] = await this.getProductIfExists(product.getListingUrl(), category);
        if (existingProduct) {
            await this.updateExistingProduct(product, category, existingProduct.getPrice(), existingConsideration);
        } else {
            await this.addNewProduct(product, category);
        }
    }

    private async addNewProduct(product: Product, category: string): Promise<void> {
        const params = {
            TableName: DynamoDbOperator.tableName,
            Item: {
                "title": {S: product.getTitle()},
                "brand": {S: product.getBrand()},
                "vendor": {S: product.getVendor()},
                "category": {S: category},
                "price": {N: product.getPrice().toString()},
                "listingUrl": {S: product.getListingUrl()},
                "productImageUrl": {S: product.getProductImageUrl()},
                "pageContentUrl": {S: product.getPageContentUrl()},
                "consideration": {S: ""}
            }
        }

        await DynamoDbOperator.client.send(new PutItemCommand(params));
        console.debug(`Added product in DynamoDB: ${product}`);
        Statistics.recordNewProductAddedToSheet(product.getVendor(), category);
    }

    private async updateExistingProduct(product: Product, category: string, oldPrice: number, existingConsideration: string): Promise<void> {
        const updateConsideration = product.getPrice() < oldPrice && existingConsideration === "NO";
        const params = {
            TableName: DynamoDbOperator.tableName,
            Item: {
                "title": {S: product.getTitle()},
                "brand": {S: product.getBrand()},
                "vendor": {S: product.getVendor()},
                "category": {S: category},
                "price": {N: product.getPrice().toString()},
                "listingUrl": {S: product.getListingUrl()},
                "productImageUrl": {S: product.getProductImageUrl()},
                "pageContentUrl": {S: product.getPageContentUrl()},
                "consideration": {S: existingConsideration}
            }
        }
        if (updateConsideration) {
            params.Item.consideration = {S: ""};
        }

        await DynamoDbOperator.client.send(new PutItemCommand(params));
        console.debug(`Updated product in DynamoDB: ${product}`);
        Statistics.recordProductUpdatedOnSheet(product.getVendor(), category)
    }

    private async getProductIfExists(listingUrl: string, category: string): Promise<[Product | null, string]> {
        const params = {
            TableName: DynamoDbOperator.tableName,
            Key: {
                "listingUrl": {S: listingUrl},
                "category": {S: category}
            }
        }

        const productOutput = await DynamoDbOperator.client.send(new GetItemCommand(params));
        if (productOutput.Item) {
            const product = new Product(
                productOutput.Item.title.S!,
                parseFloat(productOutput.Item.price.N!),
                productOutput.Item.listingUrl.S!,
                productOutput.Item.vendor.S!,
                productOutput.Item.productImageUrl.S!,
                productOutput.Item.pageContentUrl.S!
            );
            return [product, productOutput.Item.consideration.S!];
        } else {
            return [null, ""];
        }
    }
}