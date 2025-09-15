import React, { useState } from 'react';
import { motion } from "framer-motion";
import { ArrowRight, FileSliders} from "lucide-react";
import { MUSIC_MOOD, VOICE_TRAITS } from "../../constants/traits";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import {Select, SelectItem} from "../ui/select";
import { Textarea } from "../ui/textarea";

export default function TraitSummary({ traits, onUpdate }) {
  const [vocalTraits, setVocalTraits] = useState(traits?.voice_traits || {});
  const [moodAtmosphere, setMoodAtmosphere] = useState(traits?.music_mood || "default");
  const [visualTraits, setVisualTraits] = useState(traits?.visual_prompt || "");

  const handleContinue = () => {
    onUpdate({
      visual_prompt: visualTraits,
      voice_traits: vocalTraits,
      music_mood: moodAtmosphere
    });
  };

  const voiceTraitsInputs = [
    {
      label: 'Gender',
      options: VOICE_TRAITS.GENDER,
      field: 'gender',
    },
    {
      label: 'Voice Tone',
      options: VOICE_TRAITS.TONE,
      field: 'tone',
    },
    {
      label: 'Character Mood',
      options: VOICE_TRAITS.MOOD,
      field: 'mood',
    },
    {
      label: 'Emotion',
      options: VOICE_TRAITS.EMOTION,
      field: 'emotion',
    },
    {
      label: 'Accent',
      options: VOICE_TRAITS.ACCENT,
      field: 'accent',
    },
    {
      label: 'Language',
      options: VOICE_TRAITS.LANGUAGE,
      field: 'language',
    },
  ];

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
            {voiceTraitsInputs.map(({field, label, options}, index) => (
              <div key={field} className="space-y-2">
                <Label htmlFor={`voice-trait-${field}`} className="text-white">{label}</Label>
                <Select
                  id={`voice-trait-${field}`}
                  value={vocalTraits[field] || ""}
                  onChange={(e) => setVocalTraits((prevState) => ({...prevState, [field]: e.target.value}))}
                  aria-label={`Select ${label.toLowerCase()}`}
                >
                  {options.map((mood) => (
                    <SelectItem key={mood} value={mood}>{mood}</SelectItem>
                  ))}
                </Select>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="music-mood" className="text-white">Music Mood</Label>
            <Select
              id="music-mood"
              value={moodAtmosphere || ""}
              onChange={(e) => setMoodAtmosphere(e.target.value)}
              aria-label="Select music mood"
            >
              {MUSIC_MOOD.map((mood) => (
              <SelectItem key={mood} value={mood}>{mood}</SelectItem>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="visual-description" className="text-white">Visual Description</Label>
            <Textarea
              id="visual-description"
              value={visualTraits || ""}
              onChange={(e) => setVisualTraits(e.target.value)}
              className="min-h-[200px] bg-white/5 border-white/20 text-white placeholder:text-white/40 glow-border resize-none"
              aria-label="Visual description for character appearance"
            />
          </div>

          {/* Continue Button */}
          <div className="text-center">
            <Button
              onClick={handleContinue}
              className="glow-button text-white font-medium px-8 py-3 text-lg"
            >
              Continue to Generation
              <ArrowRight className="w-5 h-5 ml-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}