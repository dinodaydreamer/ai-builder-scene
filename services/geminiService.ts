
import { GoogleGenAI } from "@google/genai";
import { CharacterReference, AppConfig } from "../types";

export const generateSceneImage = async (
  prompt: string,
  config: AppConfig,
  characters: CharacterReference[],
  apiKey: string
): Promise<string> => {
  if (!apiKey) throw new Error("Vui lòng nhập API Key để tiếp tục.");

  const ai = new GoogleGenAI({ apiKey });
  const activeCharacters = characters.filter(c => c.isActive);
  
  const parts: any[] = [];
  
  if (activeCharacters.length > 0) {
    activeCharacters.forEach(char => {
      parts.push({
        inlineData: {
          data: char.image.split(',')[1],
          mimeType: "image/png"
        }
      });
    });
    parts.push({
      text: `Maintain visual consistency with these reference characters: ${activeCharacters.map(c => c.name).join(', ')}.`
    });
  }

  const selectedGenre = config.genre === "Tùy chỉnh" ? config.customGenre : config.genre;

  parts.push({
    text: `Cinematic movie scene. Genre/Visual Style: ${selectedGenre}. Shot description: ${prompt}`
  });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio: config.aspectRatio,
          imageSize: config.resolution
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("Không tìm thấy hình ảnh trong phản hồi từ AI.");
  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    throw new Error(error.message || "Lỗi khi tạo hình ảnh.");
  }
};
