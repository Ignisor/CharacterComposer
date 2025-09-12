import React, { useState } from "react";
import axios from "axios";

function App() {
  const [step, setStep] = useState(1);
  const [inputText, setInputText] = useState("");
  const [traits, setTraits] = useState(null);
  const [image, setImage] = useState(null);
  const [voiceOptions, setVoiceOptions] = useState(null);
  const [music, setMusic] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeCharacter = async () => {
    try {
      setLoading(true);
      const res = await axios.post("/analyze-character", { text: inputText });
      setTraits(res.data);
      setStep(2);
    } catch (err) {
      console.error("Analyze error:", err);
      alert("❌ Failed to analyze character. Check backend logs.");
    } finally {
      setLoading(false);
    }
  };

  const generateImage = async () => {
    try {
      setLoading(true);
      const res = await axios.post("/generate-image", {
        prompt: traits.visual_prompt,
      });
      setImage(res.data.image);
      setStep(3);
    } catch (err) {
      console.error("Image error:", err);
      alert("❌ Failed to generate image.");
    } finally {
      setLoading(false);
    }
  };

  const generateVoice = async () => {
    try {
      setLoading(true);
      const res = await axios.post("/generate-voice", {
        text: "A new hand touches the beacon. Listen. Hear me and obey. A foul darkness has seeped into my temple. A darkness that you will destroy.",
        voice_traits: traits.voice_traits,
      });
      setVoiceOptions(res.data.voice_options);
      setStep(4);
    } catch (err) {
      console.error("Voice error:", err);
      alert("❌ Failed to generate voice.");
    } finally {
      setLoading(false);
    }
  };

  const generateMusic = async () => {
    try {
      setLoading(true);
      const res = await axios.post("/generate-music", {
        mood: traits.music_mood,
      });
      setMusic(res.data.music || res.data.error);
      setStep(5);
    } catch (err) {
      console.error("Music error:", err);
      alert("❌ Failed to generate music.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-6">
      <h1 className="text-3xl font-bold mb-6">🎭 Character Composer</h1>

      {loading && <p className="text-lg animate-pulse">⏳ Generating...</p>}

      {step === 1 && (
        <div className="w-full max-w-xl">
          <textarea
            className="w-full h-40 p-3 rounded-lg text-black"
            placeholder="Paste your character description or dialogue..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button
            onClick={analyzeCharacter}
            className="mt-4 px-6 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            Analyze & Continue
          </button>
        </div>
      )}

      {step === 2 && traits && (
        <div className="max-w-xl text-left">
          <h2 className="text-xl mb-2">Extracted Traits:</h2>
          <pre className="bg-gray-800 p-4 rounded whitespace-pre-wrap break-words">
            {JSON.stringify(traits, null, 2)}
          </pre>

          <button
            onClick={generateImage}
            className="mt-4 px-6 py-2 bg-green-600 rounded-lg hover:bg-green-700"
          >
            Generate Image
          </button>
        </div>
      )}

      {step === 3 && image && (
        <div className="flex flex-col items-center">
          <img
            src={image}
            alt="Character"
            className="rounded-lg shadow-lg mb-4 max-w-[512px] max-h-[512px]"
          />
          <button
            onClick={generateVoice}
            className="px-6 py-2 bg-purple-600 rounded-lg hover:bg-purple-700"
          >
            Generate Voice
          </button>
        </div>
      )}

      {step === 4 && voiceOptions && (
        <div className="flex flex-col items-center">
          <h2 className="text-xl mb-4">🎵 Voice Options Generated</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {voiceOptions.map((voiceOption) => (
              <div
                key={voiceOption.id}
                className="bg-gray-800 p-4 rounded-lg border border-gray-600"
              >
                <h3 className="text-lg font-semibold mb-2">
                  Voice Option {voiceOption.id}
                </h3>
                <div className="mb-3">
                  <audio controls src={voiceOption.audio} className="w-full" />
                </div>
                <div className="text-sm text-gray-400">
                  <p>Duration: {voiceOption.duration?.toFixed(1)}s</p>
                  <p>Language: {voiceOption.language}</p>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={generateMusic}
            className="px-6 py-2 bg-yellow-600 rounded-lg hover:bg-yellow-700"
          >
            Generate Music
          </button>
        </div>
      )}

      {step === 5 && (
        <div className="flex flex-col items-center">
          {music?.startsWith("http") ? (
            <audio controls src={music} />
          ) : (
            <p>{music}</p>
          )}
          <p className="mt-4 text-green-400">✅ Character Package Complete!</p>
        </div>
      )}
    </div>
  );
}

export default App;
