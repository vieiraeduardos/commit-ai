import { program } from "commander";
import fs from "fs";
import { exec } from "child_process";
import * as dotenv from "dotenv";
import { GenerativeAI } from "./generative-ai";
import { confirm } from '@inquirer/prompts';

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

program.command("commit")
    .description("Generate a semantic commit")
    .action(async () => {
        get_repositories_diff(async (error, stdout) => {
            if (error) {
                console.error("Failed to get repository diff:", error);
                return;
            }
            if (stdout) {
                console.log("We are generating the commit for a moment...");

                const message = await new GenerativeAI().run(stdout);

                console.log("Commit Message");

                console.log("\n" + message + "\n");

                const answer = await confirm({ 
                    "message": "Use commit message?",
                    "default": true, 
                });

                if (answer) {
                    const safe_message = message.replace(/"/g, '\\"');

                    exec(`git add . && git commit -m "${safe_message}"`, (error: any, stdout: any, stderr: any) => {
                        if (error) {
                            console.error(`exec error: ${error}`);
                            console.error(`stderr: ${stderr}`);
                            return;
                        }

                        console.log("Message committed successfully!");
                    });
                } else {
                    console.log("All good! You can make adjustments to the source code and try to generate another!");
                }
            }
        });
    });

program.parse();