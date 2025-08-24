class ProcessQueue {
    private readonly tasks: (() => Promise<void>)[];
    private readonly concurrencyLimit: number;
    private activeCount: number;
    private currentIndex: number;
    
    constructor(concurrencyLimit: number) {
        this.tasks = [];
        this.concurrencyLimit = concurrencyLimit;
        this.activeCount = 0;
        this.currentIndex = 0;
    }
    
    addTask(task: () => Promise<void>): void {
        this.tasks.push(task);
    }
    
    async run(): Promise<void> {
        return new Promise((resolve) => {
            const next = () => {
                if (this.currentIndex >= this.tasks.length && this.activeCount === 0) {
                    resolve();
                    return;
                }
                
                while (this.activeCount < this.concurrencyLimit && this.currentIndex < this.tasks.length) {
                    const task = this.tasks[this.currentIndex++];
                    this.activeCount++;
                    task().then(() => {
                        this.activeCount--;
                        next();
                    }).catch((error) => {
                        this.activeCount--;
                        console.error("Error processing task: ", {error});
                        next();
                    });
                }
            };
            next();
        });
    }
}

export {ProcessQueue};