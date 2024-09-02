import { program } from "commander";
import fs from "fs";
import { exec } from "node:child_process";
import * as dotenv from "dotenv";

dotenv.config();

const get_repositories_diff = (callback: (error: Error | null, stdout: string | null) => void) => {
    exec("git diff", (error: any, stdout: any, stderr: any) => {
        if (error) {
            console.error(`exec error: ${error}`);
            console.error(`stderr: ${stderr}`);
            callback(error, null);
            return;
        }
        callback(null, stdout);
    });
};

const save_api_key = (api_key: string) => {
    const env_file_path = ".env";
    const env_content = `GEMINI_API_KEY=${api_key}\n`;
    fs.writeFileSync(env_file_path, env_content);
};

program
    .name("Commit AI")
    .description("CLI for Commit AI")
    .version("1.0.0");

program.command("add-key")
    .description("Add API key for Generative AI")
    .argument("<string>", "API key")
    .action((api_key: string) => {
        save_api_key(api_key);
        
        console.log("API key saved successfully!");
    });

program.parse();