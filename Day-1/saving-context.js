import 'dotenv/config';
import { GoogleGenAI } from "@google/genai";
import readlineSync from 'readline-sync';   // search it o google

const ai = new GoogleGenAI({apikey: process.env.GOOGLE_API_KEY});
const history = [];
async function chatting(userProblem) {
    // Here I am pushing user questions in the history and giving it to AI as context
    history.push(
        {
            role: "user",
            parts:[{text:userProblem}]
        }
    );
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
      contents: history,
  });
    
    // I got the response now I will save the response as context
    history.push(
        {
            role: "model",
            parts:[{text:response.text}]
      }
    );
  console.log(response.text);
}

async function main() {
    let userProblem = readlineSync.question('Ask me anything buddy 😎\n');
    await chatting(userProblem);
    await main();
}
await main();