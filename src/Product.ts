import {BRANDS} from "./constants.js";

type ProductRecord = {
    title: string;
    brand: string;
    vendor: string;
    price: number;
    listingUrl: string;
}

class Product {
    
    private readonly title: string;
    private readonly price: number;
    private readonly listingUrl: string;
    private readonly vendor: string;
    private readonly brand: string;
    
    constructor(title: string, price: number, listingUrl: string, vendor: string) {
        this.title = title;
        this.price = price;
        this.listingUrl = listingUrl;
        this.vendor = vendor;
        this.brand = this.getBrand();
    }
    
    getPrice(): number {
        return this.price;
    }
    
    toString(): string {
        return `Product(title=${this.title}, price=${this.price}, listingUrl=${this.listingUrl}, vendor=${this.vendor})`;
    }
    
    toRecord(): ProductRecord {
        return {
            title: this.title,
            price: this.price,
            listingUrl: this.listingUrl,
            vendor: this.vendor,
            brand: this.brand
        };
    }
    
    private getBrand(): string {
        return BRANDS.find(brand => this.title.toLowerCase().includes(brand.toLowerCase())) || "";
    }
    
    
}

export {Product};