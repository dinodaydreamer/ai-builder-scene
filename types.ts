
export interface CharacterReference {
  id: string;
  name: string;
  image: string; // base64
  isActive: boolean;
}

export interface Shot {
  id: string;
  number: number;
  prompt: string;
  generatedImageUrl?: string;
  isGenerating: boolean;
  error?: string;
}

export interface AppConfig {
  genre: string;
  customGenre: string;
  aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
  resolution: "1K" | "2K" | "4K";
}
