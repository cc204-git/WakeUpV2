import { GoogleGenAI } from "@google/genai";

// Use the provided API key directly to ensure the app initializes correctly.
const API_KEY = "AIzaSyBQxYO1WpfQVcO--6WC4aVz82qetLFgCNU";

if (!API_KEY) {
  throw new Error("API Key is not configured.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

function dataUrlToGeminiPart(dataUrl: string) {
  const [mimeTypePart, base64Data] = dataUrl.split(',');
  const mimeType = mimeTypePart.split(':')[1].split(';')[0];
  return {
    inlineData: {
      mimeType,
      data: base64Data,
    },
  };
}

export async function verifyGoalWithAI(goal: string, proofImageDataUrl: string): Promise<boolean> {
  try {
    const model = 'gemini-2.5-flash';
    const imagePart = dataUrlToGeminiPart(proofImageDataUrl);
    const textPart = {
      text: `You are an accountability verifier. The user's goal was: "${goal}". Look at the image provided. Does this image provide clear, unambiguous proof that the goal has been successfully completed? Your response must be a single word: YES or NO.`
    };

    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [imagePart, textPart] },
    });

    const resultText = response.text.trim().toUpperCase();
    return resultText === 'YES';
  } catch (error) {
    console.error("Error verifying goal with AI:", error);
    return false;
  }
}