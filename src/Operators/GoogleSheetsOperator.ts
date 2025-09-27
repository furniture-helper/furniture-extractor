import {google} from 'googleapis';
import {DailyStatisticsRecord, Statistics} from "../Statistics.js";

const sheets = google.sheets('v4');

const SPREADSHEET_ID = '1s_MTu2j9rOZajP8DqfiOr8qVAkr3KMSgtUtWq1AQuR0';
const SHEET_NAME = "Statistics"

class GoogleSheetsOperator {

    private static client: any = null;

    public static async addDailyStatistics(dailyStatistics: DailyStatisticsRecord[]): Promise<void> {
        if (!dailyStatistics || dailyStatistics.length === 0) {
            console.debug("No daily statistics to add to Google Sheets.");
            return;
        }
        const authClient = await this.getClient();
        const values = dailyStatistics.map(stat => [
            stat.date,
            stat.vendor,
            stat.category,
            stat.productsFetched,
            stat.productsProcessed,
            stat.productsAdded,
            stat.newProductsAddedToSheet,
            stat.productsUpdatedOnSheet
        ]);

        const resource = {
            values: values
        }

        try {
            await sheets.spreadsheets.values.append({
                auth: authClient,
                spreadsheetId: SPREADSHEET_ID,
                range: `${SHEET_NAME}!A:H`,
                valueInputOption: 'RAW',
                insertDataOption: 'INSERT_ROWS',
                requestBody: resource,
            });
            console.debug(`Added ${dailyStatistics.length} rows to Google Sheets`);
        } catch (error) {
            console.error("Failed to append daily statistics to Google Sheets:", error);
            throw error;
        }
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
}

export {GoogleSheetsOperator}