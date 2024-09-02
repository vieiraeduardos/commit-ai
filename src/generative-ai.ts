import {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} from "@google/generative-ai";

import * as dotenv from "dotenv";
dotenv.config();

export class GenerativeAI {
    genAI: GoogleGenerativeAI;
    model: any;
    generationConfig: { temperature: number; topP: number; topK: number; maxOutputTokens: number; responseMimeType: string; };

    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

        this.model = this.genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
        });

        this.generationConfig = {
            temperature: 1,
            topP: 0.95,
            topK: 64,
            maxOutputTokens: 8192,
            responseMimeType: "text/plain",
        };
    }

    async run(input: string) {
        try {
            const chatSession = this.model.startChat({
                generationConfig: this.generationConfig,
                history: [
                    {
                        role: "user",
                        parts: [
                            {
                                text: `Você é um bot especializado em gerar mensagens de commit semânticas para repositórios de código. Seu objetivo é criar mensagens de commit claras e informativas, seguindo a convenção de commits semânticos. Cada mensagem deve incluir um tipo de commit, uma descrição concisa e, quando aplicável, detalhes adicionais sobre as mudanças. 
                                Considerações:
                                Não mostra o diff.
                                Formato de Resposta: <tipo>: Breve descrição
                                         Corpo (Opcional)
                                         Rodapé (Opcional)
                                `},
                        ],
                    }
                ],
            });

            const result = await chatSession.sendMessage(input);

            return result.response.text();
        } catch (err: any) {
            console.error(err);
            throw new Error(err.message);
        }
    }

}