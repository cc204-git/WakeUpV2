import { GoogleGenAI } from "@google/genai";

// This placeholder will be replaced by the Netlify build command.
const injectedApiKey = "__GEMINI_API_KEY_PLACEHOLDER__";

export function setApiKey(key: string): void {
  // This is now only used for local development.
  localStorage.setItem('geminiApiKey', key);
}

function getApiKey(): string | null {
    // On Netlify, the injectedApiKey will be the real key.
    if (injectedApiKey && injectedApiKey !== "__GEMINI_API_KEY_PLACEHOLDER__") {
        return injectedApiKey;
    }
    // Locally, we fall back to using localStorage.
    return localStorage.getItem('geminiApiKey');
}

export function hasApiKey(): boolean {
  const key = getApiKey();
  return !!key && key !== "__GEMINI_API_KEY_PLACEHOLDER__";
}


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
  const apiKey = getApiKey();
  if (!apiKey || apiKey === "__GEMINI_API_KEY_PLACEHOLDER__") {
    // Throw an error if the key is missing or is still the placeholder.
    throw new Error("API Key is not configured correctly.");
  }

  const ai = new GoogleGenAI({ apiKey });

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