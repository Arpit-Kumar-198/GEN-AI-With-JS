import 'dotenv/config';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({apikey: process.env.GOOGLE_API_KEY});

async function main() {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
      contents: [
          {
              role: "user",     // its user
              parts:[{text:"Hi, I am Arpit."}]
          },
          {
              role: "model",    // it's model (context -> Previous Information , AI use this information to decides what answer to give)
              parts:[{text:"Hi Arpit! It's nice to meet you. How can I help you today?"}]
          },
          {
              role: "user",     // it's again user asking another question 
              parts:[{text:"what is my name?"}]
          }
    ],
  });
  console.log(response.text);
}

await main();