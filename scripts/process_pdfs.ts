// scripts/process_pdfs.ts
import { createSupabaseAdmin } from "../lib/supabaseClient"; // Adjust path if needed
import { processAndStorePdf } from "../lib/gemini";       // Adjust path if needed
import * as fs from 'node:fs/promises';
import * as path from 'path';

async function main() {
    const supabase = createSupabaseAdmin();
    const pdfsDir = path.join(process.cwd(), 'pdfs'); // Path to your pdfs directory

    try {
        const specialties = await fs.readdir(pdfsDir); // Get list of specialty folders

        for (const specialty of specialties) {
            const specialtyPath = path.join(pdfsDir, specialty);
            const isDirectory = (await fs.stat(specialtyPath)).isDirectory();

            if (isDirectory) {
                console.log(`Processing specialty: ${specialty}`);
                const files = await fs.readdir(specialtyPath);

                for (const file of files) {
                    if (file.endsWith('.pdf')) {
                        const filePath = path.join(specialtyPath, file);
                        console.log(`  Processing file: ${filePath}`);

                        try {
                            const fileBuffer = await fs.readFile(filePath); // Read the file directly
                            await processAndStorePdf(fileBuffer, filePath); // filePath as filename
                            console.log(`  Successfully processed: ${file}`);
                        } catch (error) {
                            console.error(`  Failed to process ${file}:`, error);
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error("Error reading PDFs directory:", error);
        return;
    }

    console.log("PDF processing complete.");
}

main().catch((error) => {
    console.error("Error in main function:", error);
});