import {BRANDS} from "./constants.js";

type ProductRecord = {
    title: string;
    brand: string;
    vendor: string;
    price: number;
    listingUrl: string;
	productImageUrl: string;
	productContentUrl: string;
}

class Product {
    
    private readonly title: string;
    private readonly price: number;
    private readonly listingUrl: string;
    private readonly vendor: string;
    private readonly brand: string;
	private readonly productImageUrl: string;
	private readonly pageContentUrl: string;
    
    constructor(title: string, price: number, listingUrl: string, vendor: string, productImageUrl: string, pageContentUrl: string) {
        this.title = title;
        this.price = price;
        this.listingUrl = listingUrl;
        this.vendor = vendor;
        this.brand = this.determineBrand();
		this.productImageUrl = productImageUrl;
		this.pageContentUrl = pageContentUrl;
    }
    
    getPrice(): number {
        return this.price;
    }
    
    getTitle(): string {
        return this.title;
    }
    
    getListingUrl(): string {
        return this.listingUrl;
    }
    
    getVendor(): string {
        return this.vendor;
    }
    
    getBrand(): string {
        return this.brand;
    }
	
	getProductImageUrl(): string {
		return this.productImageUrl;
	}
	
	getPageContentUrl(): string {
		return this.pageContentUrl;
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
            brand: this.brand,
            productImageUrl: this.productImageUrl,
            productContentUrl: this.pageContentUrl
        };
    }
    
    private determineBrand(): string {
        return BRANDS.find(brand => this.title.toLowerCase().includes(brand.toLowerCase())) || this.vendor;
    }
    
}

export {Product};