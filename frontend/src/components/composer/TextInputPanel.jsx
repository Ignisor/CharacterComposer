import React, { useState } from 'react';
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Sparkles, Feather, Loader2 } from "lucide-react";

export default function TextInputPanel({
  onAnalyze,
  isGenerating ,
  characterTitle,
  setCharacterTitle,
}) {
    const [description, setDescription] = useState("");

    const handleSubmit = () => {
      const text = description.trim();

      if (!text) {
        return;
      }

      onAnalyze({ text });
    };

    return (
        <motion.div
            key="text-input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto"
        >
            <Card className="glass-card glow-border">
                <CardHeader className="text-center pb-4">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <Feather className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Describe Your Character</h2>
                            <p className="text-white/60">Paint a vivid picture with your words</p>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                   {/* Character Title */}
                    <div className="space-y-2">
                        <Label htmlFor="character-title" className="text-white">Character Name/Title</Label>
                        <Input
                            id="character-title"
                            value={characterTitle}
                            onChange={(e) => setCharacterTitle(e.target.value)}
                            placeholder="e.g., Elara the Shadow Blade"
                            className="bg-white/5 border-white/20 text-white placeholder:text-white/40 glow-border"
                            aria-label="Character name or title"
                        />
                    </div>

                    {/* Character Description */}
                    <div className="space-y-2">
                        <Label htmlFor="character-description" className="text-white">Character Description</Label>
                        <Textarea
                            id="character-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe your character's appearance, personality, voice, and atmosphere in rich detail..."
                            className="min-h-[200px] bg-white/5 border-white/20 text-white placeholder:text-white/40 glow-border resize-none"
                            aria-label="Character description"
                            aria-describedby="description-tip"
                        />
                        <p id="description-tip" className="text-xs text-white/40">
                            Tip: Include details about appearance, clothing, voice tone, personality, and mood for best results
                        </p>
                    </div>

                    {/* Generate Button */}
                    <motion.div className="text-center pt-4">
                        <Button
                            onClick={handleSubmit}
                            disabled={!description.trim() || isGenerating}
                            className="glow-button text-white font-medium px-8 py-3 text-lg"
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                                    Analyzing Character...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5 mr-3" />
                                    Analyze & Generate
                                </>
                            )}
                        </Button>
                    </motion.div>
                </CardContent>
            </Card>

            {/* Tips Section */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 grid md:grid-cols-3 gap-4"
            >
                <div className="glass-card rounded-xl p-4 text-center">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                        👁️
                    </div>
                    <h3 className="text-white font-medium mb-2">Visual Details</h3>
                    <p className="text-white/60 text-sm">
                        Describe appearance, clothing, distinctive features
                    </p>
                </div>
                <div className="glass-card rounded-xl p-4 text-center">
                    <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                        🎵
                    </div>
                    <h3 className="text-white font-medium mb-2">Voice & Tone</h3>
                    <p className="text-white/60 text-sm">
                        Mention accent, voice quality, speaking style
                    </p>
                </div>
                <div className="glass-card rounded-xl p-4 text-center">
                    <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                        🎭
                    </div>
                    <h3 className="text-white font-medium mb-2">Mood & Atmosphere</h3>
                    <p className="text-white/60 text-sm">
                        Include personality, energy, emotional tone
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
}