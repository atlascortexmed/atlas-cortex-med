import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { db } from "./firebase";
import { collection, addDoc, serverTimestamp, doc, setDoc } from "firebase/firestore";

const getAiClient = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === "MY_GEMINI_API_KEY" || key.trim() === "") {
    throw new Error("API_KEY_MISSING");
  }
  return new GoogleGenAI({ apiKey: key });
};

export async function generateFullSubject(year: number, subjectTitle: string) {
  const ai = getAiClient();
  const modelName = "gemini-3.1-pro-preview";

  console.log(`[AI MOTOR] Starting full generation for ${subjectTitle} (Year ${year})...`);

  const prompt = `
    Genera un currículo médico completo para la materia "${subjectTitle}" del año ${year} de medicina.
    Debes devolver un JSON con la siguiente estructura:
    {
      "subtitle": "Breve descripción de la materia",
      "modules": [
        {
          "title": "Título del Módulo",
          "chapters": [
            {
              "title": "Título del Capítulo",
              "transcript": "Transcripción detallada de la clase (mínimo 500 palabras), con rigor clínico basado en Farreras-Rozman y GINA/GOLD 2026.",
              "quiz": {
                "question": "Pregunta de opción múltiple",
                "options": [
                  { "text": "Opción A", "isCorrect": true, "feedback": "Explicación de por qué es correcta" },
                  { "text": "Opción B", "isCorrect": false, "feedback": "Explicación de por qué es incorrecta" }
                ]
              }
            }
          ]
        }
      ],
      "books": [
        { "title": "Título del Libro", "author": "Autor", "description": "Por qué es importante", "color": "bordeaux" }
      ],
      "summaries": [
        { "title": "Título del Resumen", "content": "Contenido del resumen en formato Markdown", "details": "Detalles técnicos" }
      ],
      "cases": [
        {
          "title": "Título del Caso Clínico",
          "description": "Presentación breve",
          "patientHistory": "Historia clínica",
          "physicalExam": "Examen físico",
          "labs": "Laboratorios y estudios",
          "diagnosis": "Diagnóstico diferencial y final",
          "management": "Tratamiento y seguimiento"
        }
      ]
    }
    Incluye al menos 2 módulos, cada uno com 2 capítulos.
  `;

  try {
    const result = await ai.models.generateContent({
      model: modelName,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "Eres o Motor de Currículo Autónomo de Atlas Cortex. Tu tarefa é gerar conteúdo médico de alta qualidade, rigoroso e estruturado em JSON.",
        responseMimeType: "application/json",
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH
        }
      }
    });

    const data = JSON.parse(result.text || "{}");

    // Save to Firestore
    const subjectRef = await addDoc(collection(db, "subjects"), {
      title: subjectTitle,
      subtitle: data.subtitle || "",
      year: year,
      order: Date.now(),
      createdAt: serverTimestamp()
    });

    // Save Modules and Chapters
    for (const [mIndex, mod] of data.modules.entries()) {
      const modRef = await addDoc(collection(db, `subjects/${subjectRef.id}/modules`), {
        title: mod.title,
        order: mIndex
      });

      for (const [cIndex, chap] of mod.chapters.entries()) {
        await addDoc(collection(db, `subjects/${subjectRef.id}/modules/${modRef.id}/chapters`), {
          title: chap.title,
          transcript: chap.transcript,
          duration: "15:00",
          quiz: chap.quiz,
          order: cIndex
        });
      }
    }

    // Save Books
    if (data.books) {
      for (const [bIndex, book] of data.books.entries()) {
        await addDoc(collection(db, `subjects/${subjectRef.id}/books`), {
          ...book,
          order: bIndex
        });
      }
    }

    // Save Summaries
    if (data.summaries) {
      for (const [sIndex, summary] of data.summaries.entries()) {
        await addDoc(collection(db, `subjects/${subjectRef.id}/summaries`), {
          ...summary,
          order: sIndex
        });
      }
    }

    // Save Cases
    if (data.cases) {
      for (const [caIndex, cCase] of data.cases.entries()) {
        await addDoc(collection(db, `subjects/${subjectRef.id}/cases`), {
          ...cCase,
          order: caIndex
        });
      }
    }

    console.log(`[AI MOTOR] Successfully generated everything for ${subjectTitle}`);
    return subjectRef.id;

  } catch (error) {
    console.error("[AI MOTOR] Generation failed:", error);
    throw error;
  }
}

export async function generateQuickSummaries(subjectTitle: string, sourceMaterial: string) {
  const ai = getAiClient();
  const modelName = "gemini-3.1-pro-preview";

  console.log(`[AI MOTOR] Generating quick summaries for ${subjectTitle} based on ${sourceMaterial}...`);

  const prompt = `
    Genera una colección extensa de apuntes y resúmenes estructurados de repaso rápido para la materia "${subjectTitle}", basándote en el material/libro "${sourceMaterial}".
    Debes generar al menos 10 resúmenes clave (pueden ser más).
    Devuelve un JSON con la siguiente estructura:
    {
      "summaries": [
        { 
          "title": "Título del Resumen (ej. Fisiopatología del Asma)", 
          "content": "Contenido detallado del resumen en formato Markdown. Usa listas, negritas y viñetas para que sea de repaso rápido y estructurado.", 
          "details": "Conceptos clave o perlas clínicas" 
        }
      ]
    }
  `;

  try {
    const result = await ai.models.generateContent({
      model: modelName,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "Eres el Motor de Currículo Autónomo de Atlas Cortex. Tu tarea es generar resúmenes médicos de alto rendimiento (high-yield) estructurados en JSON.",
        responseMimeType: "application/json",
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH
        }
      }
    });

    const data = JSON.parse(result.text || "{}");

    // Create a new subject just for these summaries if needed, or we could attach them to an existing one.
    // For simplicity, let's create a "Subject" that acts as a folder for these summaries.
    const subjectRef = await addDoc(collection(db, "subjects"), {
      title: `${subjectTitle} - Repaso Rápido`,
      subtitle: `Resúmenes basados en ${sourceMaterial}`,
      year: 0, // Special year for quick reviews
      order: Date.now(),
      createdAt: serverTimestamp()
    });

    // Save Summaries
    if (data.summaries) {
      for (const [sIndex, summary] of data.summaries.entries()) {
        await addDoc(collection(db, `subjects/${subjectRef.id}/summaries`), {
          ...summary,
          order: sIndex
        });
      }
    }

    console.log(`[AI MOTOR] Successfully generated summaries for ${subjectTitle}`);
    return subjectRef.id;

  } catch (error) {
    console.error("[AI MOTOR] Summary generation failed:", error);
    throw error;
  }
}

export const STANDARD_CURRICULUM = {
  1: ["Anatomía Humana", "Histología y Embriología", "Biología Celular"],
  2: ["Fisiología Humana", "Bioquímica Médica", "Genética Médica"],
  3: ["Patología General", "Farmacología I", "Microbiología y Parasitología"],
  4: ["Semiología Médica", "Medicina Interna I", "Cirugía I"],
  5: ["Medicina Interna II", "Pediatría I", "Ginecología y Obstetricia"],
  6: ["Medicina Interna III", "Psiquiatría", "Toxicología"],
  7: ["Internado Rotatorio", "Medicina Legal", "Salud Pública"]
};
