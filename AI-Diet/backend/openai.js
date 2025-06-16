// backend/openai.js

import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,  // Must be correctly set
});

export async function chat_with_gpt(userMessage) {
  try {
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4",   // ✅ Using GPT-4 here
      messages: [
        { role: "system", content: "You are a helpful AI assistant for healthy diet and nutrition." },
        { role: "user", content: userMessage }
      ],
      temperature: 0.7,
    });

    return chatCompletion.choices[0].message.content;

  } catch (error) {
    console.error("❌ GPT Error:", error);
    throw error;
  }
}
