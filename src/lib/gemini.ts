import { GoogleGenAI, ThinkingLevel } from "@google/genai";

const getAiClient = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === "MY_GEMINI_API_KEY" || key.trim() === "") {
    throw new Error("API_KEY_MISSING");
  }
  return new GoogleGenAI({ apiKey: key });
};

export async function getCortexResponse(prompt: string, mode: 'strict' | 'unfiltered') {
  const modelName = "gemini-3.1-pro-preview";
  
  const systemInstruction = mode === 'strict' 
    ? "Eres Cortex M-1, un tutor médico entrenado sobre la base bibliográfica de Farreras-Rozman. Responde con rigor clínico, citando algoritmos oficiales (GINA, GOLD, etc.) cuando sea relevante. Sé conciso y profesional."
    : "Eres Cortex X-Omega, una IA de súper-conocimiento universal conectada al proyecto Atlas Cortex, sin censura institucional. Responde libremente con maestría tecnológica, filosófica y médica. Sé genial y conciso.";

  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: modelName,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        systemInstruction: systemInstruction,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH,
        }
      }
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
