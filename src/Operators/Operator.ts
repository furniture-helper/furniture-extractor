import {Product} from "../Product.js";

export default abstract class Operator {
    public abstract addOrUpdateProduct(product: Product, category: string): Promise<void>;
}