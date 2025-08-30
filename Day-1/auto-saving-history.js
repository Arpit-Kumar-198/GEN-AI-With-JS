import 'dotenv/config';
import { GoogleGenAI } from "@google/genai";
import readlineSync from 'readline-sync';   // search it o google

const ai = new GoogleGenAI({apikey: process.env.GOOGLE_API_KEY});

const chat = ai.chats.create({
    model: "gemini-2.5-flash",
    history: [],
  });

async function main() {
    let userProblem = readlineSync.question('Ask me anything buddy 😎\n');
    const response = await chat.sendMessage({
    message: userProblem,
    });
  console.log(response.text);
  await main();
  
}
await main();