import {Browser, chromium} from "playwright";

class BrowserManager {

    private static browser: Browser

    static async getBrowser(name: string): Promise<Browser> {
        return this.browser;
    }

    static async closeAllBrowsers(): Promise<void> {
        const closePromises = [];
        for (const name of ["default"]) {
            closePromises.push(this.closeBrowser(name));
        }
        await Promise.all(closePromises);
    }

    public static async initializeBrowser() {
        const browser = await chromium.launch({
            headless: true
        });
        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
        });
        await context.route('**/*.{png,jpg,jpeg,webp,css}', (route) => route.abort());
        this.browser = browser

    }

    private static async closeBrowser(name: string): Promise<void> {
        const browser = this.browser
        if (browser) {
            await browser.close();
            // this.browsers.delete(name);
        }
    }

}

export {BrowserManager};