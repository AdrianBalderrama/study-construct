export class DocumentLoader {
    async loadFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                resolve(e.target.result);
            };

            reader.onerror = (e) => {
                reject(new Error("Failed to read file"));
            };

            if (file.name.endsWith('.json')) {
                // Future support for JSON
                reader.readAsText(file);
            } else {
                reader.readAsText(file);
            }
        });
    }
}
