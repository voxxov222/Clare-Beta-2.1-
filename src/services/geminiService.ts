/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function generateResponse(prompt: string, context: string): Promise<string> {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            {
              text: `You are Clare, an agentic coding assistant.
              You are helping the user with their codebase.
              
              Current Codebase Context:
              ${context}
              
              User Query:
              ${prompt}
              
              Provide a concise, helpful response. If you suggest code changes, use markdown code blocks.
              Be direct and technical, like a terminal-based tool.`
            }
          ]
        }
      ],
      config: {
        temperature: 0.7,
        topP: 0.95,
        topK: 64,
      }
    });
    
    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error: Failed to connect to the AI service.";
  }
}
