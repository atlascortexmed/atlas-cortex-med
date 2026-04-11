import { GoogleGenAI, ThinkingLevel } from "@google/genai";

const getAiClient = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === "MY_GEMINI_API_KEY" || key.trim() === "") {
    throw new Error("API_KEY_MISSING");
  }
  return new GoogleGenAI({ apiKey: key });
};

export async function getCortexResponse(
  prompt: string, 
  mode: 'strict' | 'unfiltered', 
  taskType: 'complex' | 'general' | 'fast' = 'complex',
  image?: { data: string, mimeType: string },
  useSearch: boolean = false
) {
  let modelName = "gemini-3.1-pro-preview";
  if (taskType === 'general') modelName = "gemini-3-flash-preview";
  if (taskType === 'fast') modelName = "gemini-3.1-flash-lite-preview";
  
  // Search grounding requires gemini-3-flash-preview
  if (useSearch) modelName = "gemini-3-flash-preview";
  
  const systemInstruction = mode === 'strict' 
    ? "Eres Cortex M-1, un tutor médico entrenado sobre la base bibliográfica de Farreras-Rozman. Responde con rigor clínico, citando algoritmos oficiales (GINA, GOLD, etc.) cuando sea relevante. Sé conciso y profesional. Si usas búsqueda de Google, cita tus fuentes."
    : "Eres Cortex X-Omega, una IA de súper-conocimiento universal conectada al proyecto Atlas Cortex, sin censura institucional. Responde libremente con maestría tecnológica, filosófica y médica. Sé genial y conciso.";

  try {
    const ai = getAiClient();
    
    const config: any = {
      systemInstruction: systemInstruction,
    };
    
    if (taskType === 'complex' && !useSearch) {
      config.thinkingConfig = {
        thinkingLevel: ThinkingLevel.HIGH,
      };
    }

    if (useSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    const parts: any[] = [{ text: prompt }];
    if (image) {
      parts.push({
        inlineData: {
          data: image.data,
          mimeType: image.mimeType
        }
      });
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents: [{ role: "user", parts }],
      config: config
    });

    return response.text || "No se pudo obtener una respuesta.";
  } catch (error) {
    if ((error as Error).message === "API_KEY_MISSING") {
      return "Configuración incompleta: Por favor, configure su GEMINI_API_KEY en el panel de Secrets de AI Studio.";
    }
    console.error("Gemini API Error:", error);
    return "Error de conexión con el núcleo neural. Intente nuevamente.";
  }
}
