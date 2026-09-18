import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { initialData } from "./src/data/initialData";
import { AppDataState, PhotoItem, MemoryMoment, PartnerInfo } from "./src/types";

dotenv.config();

// In-memory persistent state initialized with rich defaults
let appData: AppDataState = { ...initialData };

const app = express();
const PORT = 3000;

// Body parser with 50mb limit for bulk photo uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Lazy GoogleGenAI initialization
let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (e) {
      console.error("Failed to initialize GoogleGenAI", e);
    }
  }
  return aiClient;
}

// ---------------- API ROUTES ----------------

// GET full state
app.get("/api/data", (req, res) => {
  res.json({ success: true, data: appData });
});

// UPDATE Partner Info / Settings
app.post("/api/partner", (req, res) => {
  const updated = req.body as Partial<PartnerInfo>;
  appData.partner = { ...appData.partner, ...updated };
  res.json({ success: true, partner: appData.partner });
});

// ADD Photos (Single or Bulk upload for 30-40 photos)
app.post("/api/photos", (req, res) => {
  const payload = req.body;
  const newPhotos: PhotoItem[] = Array.isArray(payload) ? payload : [payload];

  const processed: PhotoItem[] = newPhotos.map((p, idx) => ({
    id: p.id || `p_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
    url: p.url,
    caption: p.caption || "A precious moment with you",
    date: p.date || new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    location: p.location || "Together",
    chapter: p.chapter || "Everyday Magic",
    isFavorite: Boolean(p.isFavorite),
    notes: p.notes || "",
    aspectRatio: p.aspectRatio || "portrait"
  }));

  appData.photos = [...processed, ...appData.photos];
  res.json({ success: true, addedCount: processed.length, photos: appData.photos });
});

// DELETE Photo
app.delete("/api/photos/:id", (req, res) => {
  const { id } = req.params;
  appData.photos = appData.photos.filter(p => p.id !== id);
  res.json({ success: true, photos: appData.photos });
});

// TOGGLE Photo Favorite
app.post("/api/photos/:id/toggle-fav", (req, res) => {
  const { id } = req.params;
  const photo = appData.photos.find(p => p.id === id);
  if (photo) {
    photo.isFavorite = !photo.isFavorite;
  }
  res.json({ success: true, photo, photos: appData.photos });
});

// ADD Memory Moment
app.post("/api/memories", (req, res) => {
  const newMem: MemoryMoment = {
    id: `m_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    title: req.body.title || "Another Sweet Day",
    chapter: req.body.chapter || "Everyday Magic",
    date: req.body.date || "Recently",
    location: req.body.location || "Together",
    story: req.body.story || "",
    photoUrl: req.body.photoUrl || "",
    emotionEmoji: req.body.emotionEmoji || "💖",
    secretThought: req.body.secretThought || ""
  };
  appData.memories = [newMem, ...appData.memories];
  res.json({ success: true, memory: newMem, memories: appData.memories });
});

// DELETE Memory
app.delete("/api/memories/:id", (req, res) => {
  const { id } = req.params;
  appData.memories = appData.memories.filter(m => m.id !== id);
  res.json({ success: true, memories: appData.memories });
});

// OPEN Love Letter
app.post("/api/letters/:id/open", (req, res) => {
  const { id } = req.params;
  const letter = appData.letters.find(l => l.id === id);
  if (letter) {
    letter.opened = true;
    letter.openedAt = new Date().toISOString();
  }
  res.json({ success: true, letter });
});

// REDEEM Coupon
app.post("/api/coupons/:id/redeem", (req, res) => {
  const { id } = req.params;
  const coupon = appData.coupons.find(c => c.id === id);
  if (coupon) {
    coupon.redeemed = !coupon.redeemed;
  }
  res.json({ success: true, coupon, coupons: appData.coupons });
});

// ADD Custom Love Reason
app.post("/api/reasons", (req, res) => {
  const { reason, category } = req.body;
  const newReason = {
    id: `r_${Date.now()}`,
    number: appData.reasons.length + 1,
    reason: reason || "Your presence brings warmth to every room.",
    category: category || "Personality",
    favorite: true
  };
  appData.reasons = [...appData.reasons, newReason];
  res.json({ success: true, reason: newReason, reasons: appData.reasons });
});

// AI ROMANTIC POEM / WISH GENERATOR (with Gemini)
app.post("/api/generate-poem", async (req, res) => {
  const { mood, prompt, girlfriendName, qualities } = req.body;
  const ai = getAi();

  const name = girlfriendName || appData.partner.girlfriendName || "My Sweetheart";

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Write a breathtaking, deeply heartfelt, poetic birthday dedication from a boyfriend to his girlfriend named "${name}".
Mood/Theme: ${mood || "romantic, warm, grateful, soulmate"}.
Her qualities/things he adores: ${qualities || "her captivating smile, gentleness, humor, and how she makes life feel magical"}.
Personal note request: ${prompt || "A birthday wish celebrating how lucky he is to walk beside her."}
Length: 3 to 4 poetic stanzas (rhyming or lyrical free verse) with deep emotional sincerity, avoiding clichés. End with a sweet birthday closing.`,
      });

      const poem = response.text || "";
      return res.json({ success: true, poem });
    } catch (err) {
      console.error("Gemini generation error:", err);
    }
  }

  // Fallback heartfelt poem if API key is not present or rate limited
  const fallbackPoems = [
    `To ${name}, on your special day,\n\nThe world grew brighter the moment you arrived,\nAnd in your laughter, my favorite memories thrived.\nYou bring a calm that stills the restless night,\nA gentle fire, an everlasting light.\n\nThrough every season, through every quiet dawn,\nWith every gentle breath and every sweet song,\nI thank the stars for every path you tread,\nAnd every tender word that you have said.\n\nHappy Birthday, my love, my whole world, my peace,\nMay the joy in your heart never ever cease.\n\n— Forever yours with all my love ❤️`
  ];

  res.json({ success: true, poem: fallbackPoems[0] });
});

// ---------------- VITE MIDDLEWARE / STATIC SERVING ----------------

async function start() {
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
    console.log(`Celebration server running on http://0.0.0.0:${PORT}`);
  });
}

start();
