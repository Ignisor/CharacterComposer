import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import axios from "axios";
import FormData from "form-data";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

// Resolve __dirname in ESM and set path to CRA build output
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendBuildPath = path.join(__dirname, "../frontend/build");

app.use(cors({ origin: "http://localhost:3000" }));
app.use(bodyParser.json());

// Serve static frontend assets
app.use(express.static(frontendBuildPath));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Analyze character
 */
app.post("/analyze-character", async (req, res) => {
  try {
    const { text } = req.body;
    const prompt = `
You must return only one JSON object without explanations or extra text.
The structure of the JSON must be strictly as follows:

{
  "voice_traits": {
    "gender": "male | female | child",
    "tone": "deep | soft | neutral | sharp",
    "mood": "serious | calm | excited | mysterious | sad | sinister | happy",
    "emotion": "tragic | emotional | neutral | playful",
    "accent": "british | american | spanish | ukrainian | default",
    "language": "english | spanish | ukrainian | german | default"
  },
  "visual_prompt": "Short descriptive sentence of the character's appearance, suitable for an AI image generator (max 25 words)",
  "music_mood": "dark orchestral | mystical ambient | heroic epic | melancholic piano | adventurous soundtrack | electronic futuristic | calm acoustic | default"
}

Rules:
- The input text may be a description OR just a dialogue line.
- If it's a dialogue only:
  - Infer likely voice traits from wording, tone, and context.
  - For visual_prompt, make a reasonable guess about the character.
  - For music_mood, infer from mood/emotion in the dialogue. If unclear, return "default".
- Always return valid JSON.

Description: ${text}
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // consistently available model
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    const raw = response.choices[0].message.content;

    let traits;
    try {
      traits = JSON.parse(raw);
    } catch {
      traits = { error: "Failed to parse response", raw };
    }

    res.json(traits);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Failed to analyze character" });
  }
});

/**
 * Generate image (Hugging Face Stable Diffusion 2.1)
 */
app.post("/generate-image", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const response = await axios.post(
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
      { inputs: prompt },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          Accept: "image/png",
        },
        responseType: "arraybuffer",
      }
    );

    const base64Image = Buffer.from(response.data, "binary").toString("base64");
    res.json({ image: `data:image/png;base64,${base64Image}` });
  } catch (err) {
    console.error("HF Image API error:", err.response?.data || err.message);
    res.status(500).json({
      error: "Failed to generate image",
      details: err.response?.data || err.message,
    });
  }
});

/**
 * Build Voice Design prompt from voice traits
 */
function buildVoiceDesignPrompt(voiceTraits) {
  const { gender, tone, mood, emotion, accent, language } = voiceTraits;

  let prompt = "";

  // Gender and age
  if (gender === "male") prompt += "A mature male voice";
  else if (gender === "female") prompt += "A mature female voice";
  else if (gender === "child") prompt += "A young child's voice";
  else prompt += "A natural voice";

  // Tone/timbre
  if (tone === "deep") prompt += " with deep, resonant timbre";
  else if (tone === "soft") prompt += " with soft, gentle timbre";
  else if (tone === "sharp") prompt += " with sharp, crisp timbre";
  else prompt += " with neutral timbre";

  // Mood and emotion
  if (mood === "serious") prompt += ", serious and professional";
  else if (mood === "calm") prompt += ", calm and composed";
  else if (mood === "excited") prompt += ", excited and energetic";
  else if (mood === "mysterious") prompt += ", mysterious and intriguing";
  else if (mood === "sad") prompt += ", melancholic and somber";
  else if (mood === "sinister") prompt += ", dark and ominous";
  else if (mood === "happy") prompt += ", cheerful and upbeat";

  if (emotion === "tragic") prompt += " with tragic undertones";
  else if (emotion === "emotional") prompt += " with strong emotional depth";
  else if (emotion === "playful") prompt += " with playful whimsy";

  // Accent and language
  if (accent === "british") prompt += ", British accent";
  else if (accent === "american") prompt += ", American accent";
  else if (accent === "spanish") prompt += ", Spanish accent";
  else if (accent === "ukrainian") prompt += ", Ukrainian accent";

  if (language && language !== "english" && language !== "default") {
    prompt += `, speaking ${language}`;
  }

  // Quality and pacing
  prompt += ". Studio-quality recording, natural pacing, clear articulation.";

  return prompt;
}

/**
 * Generate voice (ElevenLabs Voice Design)
 */
app.post("/generate-voice", async (req, res) => {
  try {
    const { text, voice_traits } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    if (!voice_traits) {
      return res.status(400).json({ error: "voice_traits object is required" });
    }

    // Check API key
    if (!process.env.ELEVENLABS_API_KEY) {
      return res.status(500).json({ error: "ElevenLabs API key not configured" });
    }

    // Check text length limit
    const maxChars = process.env.TTS_MAX_TEXT_CHARS ? parseInt(process.env.TTS_MAX_TEXT_CHARS) : 1000;
    if (text.length > maxChars) {
      return res.status(400).json({
        error: `Text too long. Maximum ${maxChars} characters allowed.`,
        text_length: text.length,
        max_length: maxChars
      });
    }

    // Build the voice design prompt
    const voicePrompt = buildVoiceDesignPrompt(voice_traits);

    // Call ElevenLabs Voice Design API
    const response = await axios.post(
      "https://api.elevenlabs.io/v1/text-to-voice/design",
      {
        voice_description: voicePrompt,
        text: text,
        model_id: "eleven_multilingual_ttv_v2"
      },
      {
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    // Extract all preview samples
    const previews = response.data.previews;
    if (!previews || previews.length === 0) {
      return res.status(500).json({ error: "No voice preview generated" });
    }

    // Convert all previews to data URLs and include metadata
    const voiceOptions = previews.map((preview, index) => ({
      id: index + 1,
      audio: `data:audio/mpeg;base64,${preview.audio_base_64}`,
      generated_voice_id: preview.generated_voice_id,
      duration: preview.duration_secs,
      language: preview.language,
      media_type: preview.media_type
    }));

    // Return all voice options
    res.json({
      voice_options: voiceOptions,
      total_options: voiceOptions.length,
      text_used: response.data.text
    });

  } catch (err) {
    console.error("ElevenLabs API error:", err.response?.data || err.message);

    // Handle rate limits and server errors with 503
    if (err.response?.status === 429 || err.response?.status >= 500) {
      return res.status(503).json({
        error: "Voice generation service temporarily unavailable. Please try again later.",
        retry_after: err.response?.headers?.['retry-after'] || "60"
      });
    }

    // Handle other errors
    res.status(500).json({
      error: "Failed to generate voice",
      details: err.response?.data?.message || err.message
    });
  }
});
/**
 * Generate music (Mubert)
 */
// app.post("/generate-music", async (req, res) => {
//   try {
//     const { mood } = req.body;

//     if (!mood) return res.status(400).json({ error: "Music mood is required" });

//     const response = await axios.post(
//       "https://api.mubert.com/v2/GenerateTrack",
//       {
//         method: "GenerateTrackPreview",
//         params: { mood, duration: 30, format: "mp3" },
//         token: process.env.MUBERT_API_KEY,
//       },
//       { headers: { "Content-Type": "application/json" } }
//     );

//     if (response.data?.data?.download_link) {
//       res.json({ music: response.data.data.download_link });
//     } else {
//       res.json({ error: "No track generated", raw: response.data });
//     }
//   } catch (err) {
//     console.error(err.response?.data || err.message);
//     res.status(500).json({ error: "Failed to generate music" });
//   }
// });

// SPA fallback: serve index.html for all non-API GET requests
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendBuildPath, "index.html"));
});

/**
 * Start server
 */
app.listen(port, () => {
  console.log(`✅ Backend running on http://localhost:${port}`);
});
