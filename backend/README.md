# Character Composer Backend

An Express-based API that analyzes a character description with OpenAI and can generate assets (image, voice placeholder) via external AI providers. Intended to be used with the React frontend in `../frontend`.

## Requirements
- Node.js 18+ (recommend 20+)
- npm
- API keys for the features you plan to use:
  - `OPENAI_API_KEY` (required for `/analyze-character` and `test-openai.js`)
  - `HF_API_KEY` (required for `/generate-image` via Hugging Face)
  - `ELEVENLABS_API_KEY` (required for `/generate-voice` via ElevenLabs Voice Design)
  - `TTS_MAX_TEXT_CHARS` (optional, defaults to 1000 - max characters for voice generation)

## Install
```bash
cd backend
npm install
```

## Configure environment
Create a `.env` file in `backend/` with the keys you have:
```bash
cat > .env << 'EOF'
OPENAI_API_KEY=your_openai_key_here
HF_API_KEY=your_huggingface_key_here
ELEVENLABS_API_KEY=your_elevenlabs_key_here
TTS_MAX_TEXT_CHARS=1000
PORT=5000
EOF
```

Notes:
- `PORT` defaults to `5000` if omitted.

## Run the server
```bash
npm start
```
You should see: `✅ Backend running on http://localhost:5000`.

## Quick sanity check (OpenAI)
```bash
node test-openai.js
```
Expected: a small JSON-like reply. If you see 401/403, verify `OPENAI_API_KEY`.

## API reference

### POST `/analyze-character`
Analyze a free-form description or dialogue line and return structured traits.

Request body:
```json
{ "text": "A brooding knight with a tragic past" }
```

Response (shape):
```json
{
  "voice_traits": {
    "gender": "male | female | child",
    "tone": "deep | soft | neutral | sharp",
    "mood": "serious | calm | excited | mysterious | sad | sinister | happy",
    "emotion": "tragic | emotional | neutral | playful",
    "accent": "british | american | spanish | ukrainian | default",
    "language": "english | spanish | ukrainian | german | default"
  },
  "visual_prompt": "Short descriptive sentence (<= 25 words)",
  "music_mood": "dark orchestral | mystical ambient | heroic epic | melancholic piano | adventurous soundtrack | electronic futuristic | calm acoustic | default"
}
```

Curl example:
```bash
curl -s http://localhost:5000/analyze-character \
  -H 'Content-Type: application/json' \
  -d '{"text":"A brooding knight with a tragic past"}' | jq
```

### POST `/generate-image`
Generate an image via Hugging Face Stable Diffusion XL.

Request body:
```json
{ "prompt": "portrait of a brooding medieval knight, dramatic lighting" }
```

Response:
```json
{ "image": "data:image/png;base64,...." }
```

Curl example:
```bash
curl -s http://localhost:5000/generate-image \
  -H 'Content-Type: application/json' \
  -d '{"prompt":"portrait of a brooding medieval knight, dramatic lighting"}' | jq -r '.image' | head -c 80; echo
```

### POST `/generate-voice`
Generate voice audio using ElevenLabs Voice Design API. Creates a custom voice based on voice traits and generates speech from the provided text.

Request body:
```json
{
  "text": "Hello, I am a mysterious knight with a tragic past.",
  "voice_traits": {
    "gender": "male",
    "tone": "deep",
    "mood": "mysterious",
    "emotion": "tragic",
    "accent": "british",
    "language": "english"
  }
}
```

Response:
```json
{
  "voice_options": [
    {
      "id": 1,
      "audio": "data:audio/mpeg;base64,...",
      "generated_voice_id": "string",
      "duration": 2.1,
      "language": "en",
      "media_type": "mp3"
    },
    {
      "id": 2,
      "audio": "data:audio/mpeg;base64,...",
      "generated_voice_id": "string",
      "duration": 2.1,
      "language": "en",
      "media_type": "mp3"
    },
    {
      "id": 3,
      "audio": "data:audio/mpeg;base64,...",
      "generated_voice_id": "string",
      "duration": 2.1,
      "language": "en",
      "media_type": "mp3"
    }
  ],
  "total_options": 3,
  "text_used": "string"
}
```

Curl example:
```bash
curl -s http://localhost:5000/generate-voice \
  -H 'Content-Type: application/json' \
  -d '{"text":"Hello world","voice_traits":{"gender":"male","tone":"deep","mood":"serious","emotion":"neutral","accent":"american","language":"english"}}' | jq '.voice_options[0].audio' | head -c 80; echo
```

Notes:
- Uses ElevenLabs Voice Design preview feature (no voice slots consumed)
- Generates 3 different voice variations for each request
- Supports text up to 1000 characters (configurable via `TTS_MAX_TEXT_CHARS`)
- Returns 503 status for rate limits (429) or server errors (5xx) with retry guidance

### (Commented out) `/generate-music`
There is a stub for Mubert in `index.js`, currently commented out.

## Frontend
If you want to try the UI:
```bash
cd ../frontend
npm install
npm start
```
This runs on `http://localhost:3000`. CORS on the backend allows this origin.

## Troubleshooting
- OpenAI 401/403: Invalid/missing `OPENAI_API_KEY`, or account/org restrictions.
- Hugging Face 5xx/slow: Model cold start or rate limits. Retry after ~1–2 minutes.
- ElevenLabs 401: Invalid/missing `ELEVENLABS_API_KEY`.
- ElevenLabs 429/5xx: Rate limited or service unavailable. The API returns 503 with retry guidance.
- ElevenLabs 400: Invalid voice traits or text too long (check `TTS_MAX_TEXT_CHARS`).
- ESM issues: Use Node 18+; older versions may fail on native ESM.
- CORS errors in browser: Ensure the frontend runs at `http://localhost:3000` (matches server CORS).

## Project structure
```
backend/
  index.js            # Express app and routes
  test-openai.js      # Simple OpenAI connectivity test
  package.json        # Scripts and deps (type: module)
  README.md           # This file
```
