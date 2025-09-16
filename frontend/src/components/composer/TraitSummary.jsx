import React, { useState } from 'react';
import { motion } from "framer-motion";
import { ArrowRight, FileSliders, Loader2 } from "lucide-react";
import { MUSIC_MOOD, VOICE_TRAITS } from "../../constants/traits";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Select, SelectItem } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";

export default function TraitSummary({
  traits,
  onUpdate,
  isLoading,
  voiceTextUsed,
  setVoiceTextUsed,
}) {
  // traits is now the profile
  const [gender, setGender] = useState(traits?.gender || "unspecified");
  const [emotion, setEmotion] = useState(traits?.emotion || "neutral");
  const [language, setLanguage] = useState(traits?.language || "english");
  const [accent, setAccent] = useState(traits?.accent || "none");
  const [musicMood, setMusicMood] = useState(traits?.music_mood || "default");
  const [visualSummary, setVisualSummary] = useState(traits?.visual_summary || "");
  const [voiceStyle, setVoiceStyle] = useState(traits?.voice_style || "");

  const handleContinue = () => {
    onUpdate({
      schema_version: 1,
      source_text: traits?.source_text || "",
      gender,
      emotion,
      language,
      accent,
      visual_summary: visualSummary,
      style_tags: Array.isArray(traits?.style_tags) ? traits.style_tags : [],
      voice_style: voiceStyle,
      music_mood: musicMood
    });
  };

  const genderOptions = VOICE_TRAITS.GENDER.concat(["unspecified"]);
  const emotionOptions = VOICE_TRAITS.MOOD.concat(["tragic", "neutral"]);

  return (
    <motion.div
      key="trait-summary"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-6xl mx-auto"
    >
      <Card className="glass-card glow-border">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <FileSliders className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Customize Character Traits</h2>
              <p className="text-white/60">Fine-tune the extracted characteristics</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gender" className="text-white">Gender</Label>
              <Select id="gender" value={gender} onChange={(e) => setGender(e.target.value)} aria-label="Select gender">
                {genderOptions.map((opt) => (<SelectItem key={opt} value={opt}>{opt}</SelectItem>))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="emotion" className="text-white">Emotion</Label>
              <Select id="emotion" value={emotion} onChange={(e) => setEmotion(e.target.value)} aria-label="Select emotion">
                {emotionOptions.map((opt) => (<SelectItem key={opt} value={opt}>{opt}</SelectItem>))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="language" className="text-white">Language</Label>
              <Select id="language" value={language} onChange={(e) => setLanguage(e.target.value)} aria-label="Select language">
                {VOICE_TRAITS.LANGUAGE.map((opt) => (<SelectItem key={opt} value={opt}>{opt}</SelectItem>))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="accent" className="text-white">Accent</Label>
              <Select id="accent" value={accent} onChange={(e) => setAccent(e.target.value)} aria-label="Select accent">
                {[...VOICE_TRAITS.ACCENT, "none"].map((opt) => (<SelectItem key={opt} value={opt}>{opt}</SelectItem>))}
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="voice-style" className="text-white">Voice Style</Label>
            <Input id="voice-style" value={voiceStyle} onChange={(e) => setVoiceStyle(e.target.value)} className="bg-white/5 border-white/20 text-white placeholder:text-white/40 glow-border" placeholder="e.g., deep and measured" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="music-mood" className="text-white">Music Mood</Label>
            <Select
              id="music-mood"
              value={musicMood || ""}
              onChange={(e) => setMusicMood(e.target.value)}
              aria-label="Select music mood"
            >
              {MUSIC_MOOD.map((mood) => (
                <SelectItem key={mood} value={mood}>{mood}</SelectItem>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="voice-sample" className="text-white">Voice Sample</Label>
            <Textarea
              id="voice-sample"
              value={voiceTextUsed || ""}
              onChange={(e) => setVoiceTextUsed(e.target.value)}
              className="min-h-[100px] bg-white/5 border-white/20 text-white placeholder:text-white/40 glow-border resize-none"
              aria-label="Sample for voice generation"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="visual-description" className="text-white">Visual Summary</Label>
            <Textarea
              id="visual-description"
              value={visualSummary || ""}
              onChange={(e) => setVisualSummary(e.target.value)}
              className="min-h-[100px] bg-white/5 border-white/20 text-white placeholder:text-white/40 glow-border resize-none"
              aria-label="Visual description for character appearance"
            />
          </div>

          {/* Continue Button */}
          <div className="text-center">
            <Button
              onClick={handleContinue}
              className="glow-button text-white font-medium px-8 py-3 text-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  Generating Character...
                  <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                </>
              ) : (
                <>
                  Continue to Generation
                  <ArrowRight className="w-5 h-5 ml-3" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}