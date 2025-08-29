import {Product} from "./Product.js";

import {google} from 'googleapis';
import {Statistics} from "./Statistics.js";

const sheets = google.sheets('v4');

const SPREADSHEET_ID = '1s_MTu2j9rOZajP8DqfiOr8qVAkr3KMSgtUtWq1AQuR0';
const SHEET_NAME = "Dataset"

class GoogleSheetsOperator {
    
    private static client: any = null;
    
    static async addOrUpdateProduct(product: Product, category: string): Promise<void> {
        const existingRow = await this.getProductRowIfExists(product.getListingUrl(), category);
        if (existingRow) {
			
			let updateConsideration = true
            const newPrice = product.getPrice();
            const existingPrice = await this.getProductPrice(existingRow);
            if (existingPrice !== null && newPrice >= existingPrice) {
				updateConsideration = false;
            }
            
            await this.updateProduct(product, category, existingRow, updateConsideration)
        } else {
            await this.addProduct(product, category);
        }
    }
    
    static async getProductPrice(row: number): Promise<number | null> {
        const res = await sheets.spreadsheets.values.get({
            auth: await this.getClient(),
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!E${row}`,
        });
        const values = res.data.values;
        if (values && values.length > 0 && values[0].length > 0) {
            const price = parseFloat((values[0][0]).replace(',', ''));
            return isNaN(price) ? null : price;
        }
        return null;
    }
    
    private static async updateProduct(product: Product, category: string, row: number, updateConsideration: boolean): Promise<void> {
        let consideration = true;
		if (!updateConsideration) consideration = await this.getCurrentConsideration(row)
		
		const values = [
            [
                product.getTitle(),
                product.getBrand(),
                product.getVendor(),
                category,
                product.getPrice(),
                product.getListingUrl(),
                consideration,
	            product.getProductImageUrl(),
            ],
        ];
        await sheets.spreadsheets.values.update({
            auth: await this.getClient(),
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A${row}:H${row}`,
            valueInputOption: 'RAW',
            requestBody: {
                values: values
            },
        });
        Statistics.recordProductUpdatedOnSheet()
        console.debug(`Updated product in row ${row}: ${product}`);
    }
    
    private static async addProduct(product: Product, category: string): Promise<void> {
        const values = [
            [
                product.getTitle(),
                product.getBrand(),
                product.getVendor(),
                category,
                product.getPrice(),
                product.getListingUrl(),
                true,
	            product.getProductImageUrl()
            ],
        ];
        await sheets.spreadsheets.values.append({
            auth: await this.getClient(),
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A:H`,
            valueInputOption: 'RAW',
            insertDataOption: 'INSERT_ROWS',
            requestBody: {
                values: values
            },
        });
        Statistics.recordNewProductAddedToSheet()
        console.debug(`Added new product: ${product}`);
    }
    
    private static async getClient(): Promise<any> {
        if (!this.client) {
            const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON!);
            const auth = new google.auth.GoogleAuth({
                credentials: {
                    client_email: serviceAccount.client_email,
                    private_key: serviceAccount.private_key,
                },
                scopes: ['https://www.googleapis.com/auth/spreadsheets'],
            });
            this.client = auth.getClient();
        }
        return this.client;
    }
    
    private static async getProductRowIfExists(url: string, category: string): Promise<number | null> {
        const res = await sheets.spreadsheets.values.get({
            auth: await this.getClient(),
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!D:F`,
        });
        const rows = res.data.values;
        if (rows) {
            for (let i = 0; i < rows.length; i++) {
                if (rows[i][2] === url && rows[i][0] === category) {
                    return i + 1;
                }
            }
        }
        return null;
    }
	
	private static async getCurrentConsideration(row: number): Promise<boolean> {
		const res = await sheets.spreadsheets.values.get({
			auth: await this.getClient(),
			spreadsheetId: SPREADSHEET_ID,
			range: `${SHEET_NAME}!G${row}`,
		});
		const values = res.data.values;
		if (values && values.length > 0 && values[0].length > 0) {
			return values[0][0] === 'TRUE';
		}
		return false;
		
	}
    
}

export {GoogleSheetsOperator}