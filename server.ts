import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import admin from "firebase-admin";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
// @ts-ignore
import firebaseConfig from "./firebase-applet-config.json" assert { type: "json" };

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: firebaseConfig.projectId,
  });
}

const db = admin.firestore();

// Check for placeholder key
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
  console.warn("[AI MOTOR] WARNING: GEMINI_API_KEY is missing or using placeholder value. Please set it in the Secrets panel.");
}

const genAI = new GoogleGenAI({ apiKey: apiKey || "" });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // AI Motor: Autonomous Curriculum Generator
  app.post("/api/admin/generate-curriculum", async (req, res) => {
    const { year, subjectTitle } = req.body;
    
    if (!year || !subjectTitle) {
      return res.status(400).json({ error: "Year and subjectTitle are required" });
    }

    res.json({ message: "Generation started in background" });

    // Background task
    (async () => {
      try {
        console.log(`[AI MOTOR] Generating curriculum for ${subjectTitle} (Year ${year})...`);
        
        const prompt = `Genera un módulo completo para la materia "${subjectTitle}" del año ${year} de medicina. Incluye al menos 3 capítulos con transcripciones detalladas y un quiz por capítulo.`;
        
        const result = await genAI.models.generateContent({
          model: "gemini-3.1-pro-preview",
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          config: {
            systemInstruction: "Eres el Motor de Currículo Autónomo de Atlas Cortex. Tu tarea es generar una estructura completa de un módulo médico para un año específico. Debes devolver un JSON con la estructura: { modules: [ { title, chapters: [ { title, transcript, quiz: { question, options: [{text, isCorrect, feedback}] } } ] } ] }. El contenido debe ser riguroso, basado en Farreras-Rozman y GINA/GOLD 2026.",
            responseMimeType: "application/json",
            thinkingConfig: {
              thinkingLevel: ThinkingLevel.HIGH
            }
          }
        });

        const data = JSON.parse(result.text || "{}");
        
        // Save to Firestore
        const subjectRef = db.collection("subjects").doc();
        await subjectRef.set({
          title: subjectTitle,
          year: parseInt(year),
          order: Date.now(),
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        for (const mod of data.modules) {
          const modRef = subjectRef.collection("modules").doc();
          await modRef.set({
            title: mod.title,
            order: Date.now()
          });

          for (const chap of mod.chapters) {
            const chapRef = modRef.collection("chapters").doc();
            await chapRef.set({
              title: chap.title,
              transcript: chap.transcript,
              duration: "15:00",
              quiz: chap.quiz,
              order: Date.now()
            });
          }
        }
        
        console.log(`[AI MOTOR] Successfully generated ${subjectTitle}`);
      } catch (error) {
        console.error("[AI MOTOR] Generation failed:", error);
      }
    })();
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
