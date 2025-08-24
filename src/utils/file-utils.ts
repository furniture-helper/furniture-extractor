import fs from 'fs';

function recordsToCsv(data: Record<string, any>[], filename: string): void {
    if (data.length === 0) {
        console.log("No data to write.");
        return;
    }
    
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(",")];
    
    for (const record of data) {
        const values = headers.map(header => {
            const escaped = ('' + record[header]).replace(/"/g, '""');
            return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
    }
    
    const csvContent = csvRows.join('\n');
    
    fs.writeFileSync(filename, csvContent);
    console.log(`Data written to ${filename}`);
}

function save_html(content: string, filename: string): void {
    fs.writeFileSync(filename, content);
    console.log(`HTML content saved to ${filename}`);
}

export {recordsToCsv, save_html};