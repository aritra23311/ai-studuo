
import { GoogleGenAI, Modality } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This is a fallback for development; in production, the key is expected to be present.
  // In a real app, you might show a user-friendly message.
  console.warn("API_KEY environment variable not set. Using a placeholder. App may not function.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY || 'MISSING_API_KEY' });

export const editImageWithGemini = async (
  base64ImageData: string,
  mimeType: string,
  prompt: string
): Promise<string> => {
  if (!API_KEY) {
      throw new Error("API Key is not configured. Please set the API_KEY environment variable.");
  }
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64ImageData,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        return base64ImageBytes;
      }
    }

    throw new Error("No image data was found in the Gemini API response.");

  } catch (error) {
    console.error("Error editing image with Gemini:", error);
    if (error instanceof Error) {
      // Provide a more user-friendly error message
      if (error.message.includes('API key not valid')) {
          throw new Error('The provided API key is not valid. Please check your configuration.');
      }
      throw new Error(`Failed to edit image: ${error.message}`);
    }
    throw new Error("An unknown error occurred while communicating with the image editing service.");
  }
};
