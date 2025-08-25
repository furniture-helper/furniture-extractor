import {Browser, chromium} from "playwright";

class BrowserManager {
    
    private static browsers: Map<string, Browser> = new Map();
    
    static async getBrowser(name: string): Promise<Browser> {
        if (this.browsers.has(name)) {
            return this.browsers.get(name)!;
        }
        const browser = await chromium.launch({
            headless: true
        });
        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
        });
        await context.route('**/*.{png,jpg,jpeg,webp,css}', (route) => route.abort());
        this.browsers.set(name, browser);
        return browser;
    }
    
    static async closeAllBrowsers(): Promise<void> {
        const closePromises = [];
        for (const name of this.browsers.keys()) {
            closePromises.push(this.closeBrowser(name));
        }
        await Promise.all(closePromises);
    }
    
    private static async closeBrowser(name: string): Promise<void> {
        const browser = this.browsers.get(name);
        if (browser) {
            await browser.close();
            this.browsers.delete(name);
        }
    }
    
}

export {BrowserManager};