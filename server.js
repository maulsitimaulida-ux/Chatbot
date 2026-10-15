import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Sajikan frontend (index.html, style.css, script.js) dari folder "public"
app.use(express.static(path.join(__dirname, 'public')));

if (!process.env.GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY belum diisi. Buat file .env (lihat .env.example).');
  process.exit(1);
}

const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL_NAME = 'gemini-2.5-flash';
const PORT = process.env.PORT || 3000;

// Instruksi agar AI menjawab sebagai asisten sekolah (silakan sesuaikan)
const SYSTEM_INSTRUCTION =
  'Kamu adalah Asisten Sekolah SMK Muhammadiyah 1 Kota Sukabumi. ' +
  'Jawab dalam Bahasa Indonesia dengan ramah, singkat, dan jelas. ' +
  'Jika tidak yakin dengan informasi spesifik sekolah, sarankan menghubungi pihak sekolah.';

// Endpoint tanya AI
app.post('/tanya-ai', async (req, res) => {
  const { pertanyaan } = req.body;
  if (!pertanyaan) return res.status(400).json({ error: 'Pertanyaan wajib diisi!' });

  try {
    const hasil = await gemini.models.generateContent({
      model: MODEL_NAME,
      contents: pertanyaan,
      config: { systemInstruction: SYSTEM_INSTRUCTION },
    });
    res.status(200).json({ jawaban: hasil.text });
  } catch (error) {
    console.error('Gemini error:', error);
    res.status(500).json({ error: 'Gagal memproses API Gemini' });
  }
});

app.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
});
