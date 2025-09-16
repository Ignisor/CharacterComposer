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

// Simple request-scoped logger
function createRequestId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

app.use((req, res, next) => {
  req.requestId = createRequestId();
  req.log = (...args) => console.log(`[req:${req.requestId}]`, ...args);
  next();
});

// Utility: chunk large log strings to avoid truncation
function logChunked(log, label, content, chunkSize = 1000, maxTotal = 4000) {
  if (!log) return;
  const text = String(content ?? "");
  const capped = text.length > maxTotal ? text.slice(0, maxTotal) : text;
  if (text.length > maxTotal) {
    log(`${label} length=${text.length} (truncated to ${maxTotal})`);
  }
  for (let i = 0; i < capped.length; i += chunkSize) {
    const end = Math.min(i + chunkSize, capped.length);
    log(`${label} [${i}-${end}]`, capped.slice(i, end));
  }
}

/**
 * Analyze character
 */
app.post("/analyze-character", async (req, res) => {
  try {
    let inputText = req.body?.text;
    if (typeof inputText === "object" && inputText?.text) {
      inputText = inputText.text;
    }
    if (!inputText || typeof inputText !== "string") {
      return res.status(400).json({ error: "Body must include { text: string }" });
    }

    req.log("/analyze-character input", {
      text_preview: inputText,
      length: inputText.length,
    });

    const prompt = `You must return only one JSON object without explanations or extra text.
The JSON must strictly match this minimal CharacterProfile schema and value restrictions:
{
  "schema_version": 1,
  "source_text": string,
  "gender": "male" | "female" | "child" | "unspecified",
  "emotion": "serious" | "calm" | "excited" | "mysterious" | "sad" | "sinister" | "happy" | "tragic" | "neutral",
  "language": "english" | "spanish" | "ukrainian" | "german",
  "accent": "british" | "american" | "spanish" | "ukrainian" | "none",
  "visual_summary": "Short character appearance line (<= 25 words)",
  "style_tags": string[],
  "voice_style": "Short phrase for voice color (<= 12 words)",
  "music_mood": "dark orchestral" | "mystical ambient" | "heroic epic" | "melancholic piano" | "adventurous soundtrack" | "electronic futuristic" | "calm acoustic" | "default"
}
Rules:
- The input text may be a description OR a dialogue line; infer reasonably.
- Keep style_tags concise (<= 3), e.g., ["cinematic", "photorealistic"].
- Default accent to "none" if unclear.
- Use only the allowed enum values.
- Always return valid JSON with double quotes.

Input text: ${inputText}`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    const raw = response.choices[0].message.content;
    let profile;
    try {
      profile = JSON.parse(raw);
    } catch {
      req.log("/analyze-character parse_error", { raw_preview: String(raw).slice(0, 200) });
      return res.status(500).json({ error: "Failed to parse profile", raw });
    }

    // Minimal normalization
    const allowed = {
      gender: ["male", "female", "child", "unspecified"],
      emotion: ["serious", "calm", "excited", "mysterious", "sad", "sinister", "happy", "tragic", "neutral"],
      language: ["english", "spanish", "ukrainian", "german"],
      accent: ["british", "american", "spanish", "ukrainian", "none"],
      music_mood: [
        "dark orchestral",
        "mystical ambient",
        "heroic epic",
        "melancholic piano",
        "adventurous soundtrack",
        "electronic futuristic",
        "calm acoustic",
        "default",
      ],
    };

    const normalized = {
      schema_version: 1,
      source_text: inputText,
      gender: allowed.gender.includes(profile.gender) ? profile.gender : "unspecified",
      emotion: allowed.emotion.includes(profile.emotion) ? profile.emotion : "neutral",
      language: allowed.language.includes(profile.language) ? profile.language : "english",
      accent: allowed.accent.includes(profile.accent) ? profile.accent : "none",
      visual_summary: typeof profile.visual_summary === "string" ? profile.visual_summary : "",
      style_tags: Array.isArray(profile.style_tags) ? profile.style_tags.slice(0, 3) : [],
      voice_style: typeof profile.voice_style === "string" ? profile.voice_style : "natural and clear",
      music_mood: allowed.music_mood.includes(profile.music_mood) ? profile.music_mood : "default",
    };
    req.log("/analyze-character output", {
      gender: normalized.gender,
      emotion: normalized.emotion,
      language: normalized.language,
      accent: normalized.accent,
      music_mood: normalized.music_mood,
      visual_summary_preview: normalized.visual_summary.slice(0, 120),
      style_tags: normalized.style_tags,
      voice_style: normalized.voice_style,
    });
    res.json({ character_profile: normalized });
  } catch (err) {
    req.log("/analyze-character error", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to analyze character" });
  }
});

/**
 * Generate image (Hugging Face Stable Diffusion 2.1)
 */
app.post("/generate-image", async (req, res) => {
  try {
    const { character_profile, options } = req.body || {};
    if (!character_profile) {
      return res.status(400).json({ error: "character_profile is required" });
    }

    if (!process.env.HF_API_KEY) {
      return res.status(500).json({ error: "Hugging Face API key not configured" });
    }

    req.log("/generate-image input", {
      gender: character_profile.gender,
      emotion: character_profile.emotion,
      intent: options?.intent || "portrait",
      style_tags: character_profile.style_tags,
    });

    const { prompt, negative_prompt } = await createImagePromptFromProfile(character_profile, options, req.log);
    req.log("/generate-image prompt", { prompt_preview: String(prompt).slice(0, 200), negative_prompt });

    // SDXL Inference API does not have a separate negative field here; fold it in.
    const combinedPrompt = negative_prompt
      ? `${prompt}. Negative: ${negative_prompt}`
      : prompt;

    const response = await axios.post(
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
      { inputs: combinedPrompt },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          Accept: "image/png",
        },
        responseType: "arraybuffer",
      }
    );

    const contentType = response.headers?.["content-type"] || "";
    if (!contentType.includes("image/")) {
      // Model may be loading or returned JSON with error/estimated_time
      try {
        const asString = Buffer.from(response.data).toString("utf-8");
        const json = JSON.parse(asString);
        if (json.estimated_time) {
          const retryAfter = Math.ceil(Number(json.estimated_time));
          req.log("/generate-image model_loading", { estimated_time: json.estimated_time });
          return res.status(503).json({
            error: "Image model is loading. Please retry shortly.",
            retry_after: String(retryAfter || 30),
          });
        }
        return res.status(500).json({ error: json.error || "Image generation failed" });
      } catch (_) {
        req.log("/generate-image unexpected_response", { note: "non-image, non-JSON payload" });
        return res.status(500).json({ error: "Unexpected response from image service" });
      }
    }

    const base64Image = Buffer.from(response.data, "binary").toString("base64");
    req.log("/generate-image success", { bytes: base64Image.length });
    res.json({ image: `data:image/png;base64,${base64Image}`, prompt_used: prompt, negative_prompt_used: negative_prompt });
  } catch (err) {
    let details = err.message;
    if (err.response?.data && Buffer.isBuffer(err.response.data)) {
      try {
        const asString = err.response.data.toString("utf-8");
        const json = JSON.parse(asString);
        details = json.error || json.message || asString;
      } catch (_) {
        details = err.response.data.toString("utf-8");
      }
    } else if (typeof err.response?.data === "object") {
      details = err.response.data.error || err.response.data.message || JSON.stringify(err.response.data);
    }
    req.log("/generate-image error", details);

    if (err.response?.status === 429 || err.response?.status >= 500) {
      return res.status(503).json({
        error: "Image generation service temporarily unavailable. Please try again later.",
        retry_after: err.response?.headers?.["retry-after"] || "60",
        details,
      });
    }
    if (err.response?.status === 401 || err.response?.status === 403) {
      return res.status(err.response.status).json({
        error: "Unauthorized or quota exceeded for Hugging Face API.",
        details,
      });
    }
    res.status(500).json({ error: "Failed to generate image", details });
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
    const { character_profile, text } = req.body || {};
    if (!character_profile) {
      return res.status(400).json({ error: "character_profile is required" });
    }

    // Check API key
    if (!process.env.ELEVENLABS_API_KEY) {
      return res.status(500).json({ error: "ElevenLabs API key not configured" });
    }

    const maxChars = process.env.TTS_MAX_TEXT_CHARS ? parseInt(process.env.TTS_MAX_TEXT_CHARS) : 1000;
    const providedText = (typeof text === "string" && text.trim().length > 0) ? text.trim() : "";

    if (providedText.length > maxChars) {
      return res.status(400).json({
        error: `Text too long. Maximum ${maxChars} characters allowed.`,
        text_length: providedText.length,
        max_length: maxChars
      });
    }

    req.log("/generate-voice input", {
      gender: character_profile.gender,
      emotion: character_profile.emotion,
      accent: character_profile.accent,
      language: character_profile.language,
      text_length: providedText.length,
    });

    // Build the voice design description using GPT; fallback to deterministic builder
    let voiceDesign;
    try {
      voiceDesign = await createVoiceDescriptionFromProfile(character_profile, req.log);
    } catch (e) {
      // Fallback mapping to prior deterministic prompt
      const mapped = {
        gender: character_profile.gender === "male" || character_profile.gender === "female" || character_profile.gender === "child"
          ? character_profile.gender
          : undefined,
        tone: character_profile.voice_style || undefined,
        mood: character_profile.emotion || undefined,
        emotion: character_profile.emotion || undefined,
        accent: character_profile.accent && character_profile.accent !== "none" ? character_profile.accent : undefined,
        language: character_profile.language || undefined,
      };
      voiceDesign = { voice_description: buildVoiceDesignPrompt(mapped), language: character_profile.language || "english" };
    }

    req.log("/generate-voice description", { voice_description: voiceDesign.voice_description });

    // Choose final text with minimum length 100 characters
    const minChars = 100;
    const gptSample = sanitizeSampleText(voiceDesign.sample_text);
    const providedClean = sanitizeSampleText(providedText);
    let chosenText = (gptSample && gptSample.length >= minChars)
      ? gptSample
      : (providedClean.length >= minChars ? providedClean : buildSampleTextFromProfile(character_profile, minChars));
    if (!chosenText || chosenText.length < minChars) {
      // Ensure minimum length even if all sources are short
      const filler = " I speak steadily, with clarity and purpose, revealing more of my intent with every breath I take.";
      while (chosenText.length < minChars) {
        chosenText += filler;
      }
    }
    if (chosenText.length > maxChars) {
      chosenText = chosenText.slice(0, maxChars);
    }

    const response = await axios.post(
      "https://api.elevenlabs.io/v1/text-to-voice/design",
      {
        voice_description: voiceDesign.voice_description,
        text: chosenText,
        model_id: "eleven_multilingual_ttv_v2"
      },
      {
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    const previews = response.data.previews;
    if (!previews || previews.length === 0) {
      return res.status(500).json({ error: "No voice preview generated" });
    }

    const voiceOptions = previews.map((preview, index) => ({
      id: index + 1,
      audio: `data:audio/mpeg;base64,${preview.audio_base_64}`,
      generated_voice_id: preview.generated_voice_id,
      duration: preview.duration_secs,
      language: preview.language,
      media_type: preview.media_type
    }));

    req.log("/generate-voice success", { total_options: voiceOptions.length, text_used_length: chosenText.length, text_used_preview: chosenText.slice(0, 140) });
    res.json({
      voice_options: voiceOptions,
      total_options: voiceOptions.length,
      text_used: chosenText,
      voice_description_used: voiceDesign.voice_description
    });

  } catch (err) {
    req.log("/generate-voice error", err.response?.data || err.message);

    if (err.response?.status === 429 || err.response?.status >= 500) {
      return res.status(503).json({
        error: "Voice generation service temporarily unavailable. Please try again later.",
        retry_after: err.response?.headers?.['retry-after'] || "60"
      });
    }

    res.status(500).json({
      error: "Failed to generate voice",
      details: err.response?.data?.message || err.message
    });
  }
});

/**
 * Orchestrators: Craft prompts/descriptions via GPT from CharacterProfile
 */
async function createImagePromptFromProfile(profile, options, log) {
  const intent = options?.intent || "portrait";
  const composition = intent === "full_body" ? "full body" : intent === "scene" ? "dynamic scene" : "portrait";
  const system = `You are a prompt generator for Stable Diffusion image generation (v2.1).
Your task is to take a character description or scene excerpt from a book and convert it into a visual image prompt suitable for Stable Diffusion.

Follow these best practices:
- Describe character appearance: gender, age, race/species, body type, hair, eyes, clothing, accessories.
- Include pose, expression, or movement if implied.
- Add style modifiers: realistic, fantasy art, cinematic, digital painting, photorealistic, anime, etc.
- Add mood/lighting: warm glow, moonlit, dark shadows, ethereal light.
- Specify composition: portrait, bust, full body, dynamic scene.
- Do not invent extra details beyond the text, but you may extrapolate mood, setting, or style.
- Keep the prompt clear and concise (1–3 sentences).
- Add a default negative prompt to reduce artifacts: "blurry, distorted, deformed, extra limbs, low resolution".

Output JSON only with fields { "image_prompt": string, "negative_prompt": string }.`;
  const inputPassage = typeof profile?.source_text === "string" ? profile.source_text : "";
  const contextHints = {
    gender: profile?.gender,
    emotion: profile?.emotion,
    visual_summary: profile?.visual_summary,
    style_tags: profile?.style_tags || [],
    composition
  };
  const user = `Input:\n${inputPassage}\n\nContext (hints, optional):\n${JSON.stringify(contextHints)}\n\nReturn JSON: {\n  "image_prompt": "<Stable Diffusion image generation prompt>",\n  "negative_prompt": "blurry, distorted, deformed, extra limbs, low resolution"\n}`;

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    temperature: 0.3,
  });
  const raw = response.choices[0].message.content;
  logChunked(log, "orchestrator:image gpt_raw", raw);
  try {
    const parsed = safeParseJson(raw, log);
    return {
      prompt: typeof parsed.image_prompt === "string" && parsed.image_prompt.length > 0
        ? parsed.image_prompt
        : (typeof parsed.prompt === "string" && parsed.prompt.length > 0
          ? parsed.prompt
          : buildFallbackImagePrompt(profile, intent)),
      negative_prompt: typeof parsed.negative_prompt === "string" ? parsed.negative_prompt : "blurry, distorted, deformed, extra limbs, low resolution",
    };
  } catch {
    if (log) log("orchestrator:image parse_fallback");
    return {
      prompt: buildFallbackImagePrompt(profile, intent),
      negative_prompt: "blurry, distorted, deformed, extra limbs, low resolution",
    };
  }
}

function buildFallbackImagePrompt(profile, intent) {
  const tags = Array.isArray(profile.style_tags) && profile.style_tags.length > 0 ? `, ${profile.style_tags.join(", ")}` : "";
  const intentText = intent === "full_body" ? ", full-body" : intent === "scene" ? ", scenic" : ", portrait";
  return `${profile.visual_summary || "Character portrait"}${intentText}${tags}`.trim();
}

async function createVoiceDescriptionFromProfile(profile, log) {
  const system = `You design voice prompts for ElevenLabs Voice Design. Return JSON only, no markdown or code fences.
The voice description should follow this reference format where possible, omitting parts we lack:
[AUDIO QUALITY]
[AGE] [GENDER / GENDER-NEUTRAL / VOICE IDENTITY]
[TONE / TIMBRE]
[ACCENT]
[PACING & RHYTHM]
[PROFESSION / ROLE]
[EMOTION / ATTITUDE / STYLE]
[OPTIONAL EXTRA DETAILS]`;
  const user = `CharacterProfile JSON:\n${JSON.stringify(profile)}\n\nInstructions:\n- Use available fields: gender, emotion, accent, language, voice_style. Infer age only if implied (else omit).\n- Keep the description concise (1-4 short lines).\n- Provide a sample line that reflects the style and is at least 100 characters.\n- Return JSON only with fields: {\n  "voice_description": string,\n  "language": string,\n  "sample_text": string\n}`;
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    temperature: 0.3,
  });
  const raw = response.choices[0].message.content;
  logChunked(log, "orchestrator:voice gpt_raw", raw);
  const parsed = safeParseJson(raw, log);
  if (log) log("orchestrator:voice parsed_lengths", {
    desc_len: typeof parsed.voice_description === "string" ? parsed.voice_description.length : 0,
    sample_len: typeof parsed.sample_text === "string" ? parsed.sample_text.length : 0,
  });
  return {
    voice_description: parsed.voice_description,
    language: parsed.language || profile.language || "english",
    sample_text: typeof parsed.sample_text === "string" ? parsed.sample_text : undefined,
  };
}

function buildSampleTextFromProfile(profile, minChars = 100) {
  const base = profile?.visual_summary || "I speak with calm certainty, revealing my intentions with poise and control.";
  let text = base;
  const fillers = [
    " My words carry the weight of experience, deliberate and measured.",
    " Each syllable lands with intention, steady as a heartbeat.",
    " There is a quiet resolve beneath the surface of my tone.",
  ];
  let i = 0;
  while (text.length < minChars) {
    text += fillers[i % fillers.length];
    i += 1;
  }
  return text;
}

function sanitizeSampleText(text) {
  if (typeof text !== "string") return "";
  let t = text.trim();
  // Strip wrapping quotes
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith('“') && t.endsWith('”'))) {
    t = t.slice(1, -1).trim();
  }
  // Collapse whitespace/newlines
  t = t.replace(/\s+/g, ' ').trim();
  return t;
}
/**
 * Generate music
 */
function buildMusicPromptFromMood(mood) {
  const moodMap = {
    "dark orchestral": "Dark, brooding orchestral theme with low strings, ominous brass, and subtle choir",
    "mystical ambient": "Ethereal ambient soundscape with airy pads, shimmering textures, and gentle chimes",
    "heroic epic": "Epic cinematic score with triumphant brass, soaring strings, and powerful percussion",
    "melancholic piano": "Intimate melancholic piano with soft reverb, slow tempo, emotional chords",
    "adventurous soundtrack": "Adventurous cinematic track with rhythmic strings, light percussion, and a sense of journey",
    "electronic futuristic": "Futuristic electronic track with driving synths, pulsing bass, and modern sound design",
    "calm acoustic": "Calm acoustic guitar with warm tones, subtle percussion, and peaceful atmosphere",
    default: "Cinematic instrumental underscore with a neutral, immersive mood",
  };
  return moodMap[mood] || moodMap.default;
}

app.post("/generate-music", async (req, res) => {
  try {
    const { mood, length_ms } = req.body || {};

    if (!process.env.ELEVENLABS_API_KEY) {
      return res.status(500).json({ error: "ElevenLabs API key not configured" });
    }

    if (!mood || typeof mood !== "string") {
      return res.status(400).json({ error: "mood is required (string)" });
    }

    const musicLengthMs = typeof length_ms === "number" && length_ms > 0 ? Math.min(length_ms, 30000) : 10000;
    const prompt = buildMusicPromptFromMood(mood);

    req.log("/generate-music input", { mood, musicLengthMs, prompt_preview: String(prompt).slice(0, 120) });

    // ElevenLabs Music compose (PoC) — request MP3 bytes and return as data URL
    const response = await axios.post(
      "https://api.elevenlabs.io/v1/music/compose",
      {
        prompt,
        music_length_ms: musicLengthMs,
      },
      {
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
          Accept: "audio/mpeg,application/json",
        },
        responseType: "arraybuffer",
      }
    );

    const contentType = response.headers?.["content-type"] || "";

    // If we received audio bytes directly
    if (contentType.includes("audio/")) {
      const base64Audio = Buffer.from(response.data, "binary").toString("base64");
      req.log("/generate-music success", { bytes: base64Audio.length, contentType });
      return res.json({ music: `data:audio/mpeg;base64,${base64Audio}`, prompt_used: prompt, mood_used: mood });
    }

    // Otherwise attempt to parse JSON from the buffer
    let parsed;
    try {
      const asString = Buffer.from(response.data).toString("utf-8");
      parsed = JSON.parse(asString);
    } catch (e) {
      req.log("/generate-music unexpected_response", { note: "non-audio, non-JSON payload" });
      return res.status(500).json({ error: "Unexpected response from music service" });
    }

    // Try common fields that might contain base64 audio
    const base64Field = parsed.audio_base_64 || parsed.audio_base64 || parsed.audio || parsed.track_base64 || null;
    if (typeof base64Field === "string" && base64Field.length > 0) {
      req.log("/generate-music success(json)", { length: base64Field.length });
      return res.json({ music: `data:audio/mpeg;base64,${base64Field}`, prompt_used: prompt, mood_used: mood });
    }

    // If JSON contains an error-like detail, surface it
    if (parsed?.detail) {
      return res.status(502).json({ error: "Music generation failed", details: parsed.detail });
    }

    return res.status(500).json({ error: "Music generation returned no audio" });
  } catch (err) {
    let details = err.message;
    // If the error payload is a Buffer, try to decode JSON for useful message
    if (err.response?.data && Buffer.isBuffer(err.response.data)) {
      try {
        const asString = err.response.data.toString("utf-8");
        const json = JSON.parse(asString);
        details = json.detail || json.message || asString;
      } catch (_) {
        details = err.response.data.toString("utf-8");
      }
    } else if (typeof err.response?.data === "object") {
      details = err.response.data;
    }
    req.log("/generate-music error", details);

    if (err.response?.status === 429 || err.response?.status >= 500) {
      return res.status(503).json({
        error: "Music generation service temporarily unavailable. Please try again later.",
        retry_after: err.response?.headers?.["retry-after"] || "60",
      });
    }

    if (err.response?.status === 401 || err.response?.status === 403) {
      return res.status(err.response.status).json({
        error: "Unauthorized for ElevenLabs Music API. Check plan/access and API key.",
        details,
      });
    }

    return res.status(500).json({
      error: "Failed to generate music",
      details,
    });
  }
});

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
