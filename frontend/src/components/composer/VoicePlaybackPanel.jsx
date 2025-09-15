import React from 'react';
import { motion } from "framer-motion";
import { Mic, RotateCcw, Loader2 } from "lucide-react";
import { DEFAULT_VOICE_SAMPLE } from "../../constants/traits";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button, BUTTON_VARIANT } from "../ui/button";

export default function VoicePlaybackPanel({
  generatedContent,
  isGenerating,
  onRegenerate,
}) {
    return (
        <Card className="glass-card glow-border h-fit">
            <CardHeader>
                <CardTitle className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
                            <Mic className="w-5 h-5 text-white" />
                        </div>
                        Voice Playback
                    </div>
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Voice Generation Status */}
                {!!generatedContent.length ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4"
                    >
                      {generatedContent.map((voice) => (
                        <audio key={voice.id} controls src={voice.audio} title={`voice-${voice.id}`}></audio>
                      ))}

                        {/* Sample Dialogue */}
                        <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg p-4">
                            <p className="text-xs text-white/60 mb-2">Sample Dialogue:</p>
                            <p className="text-white italic text-center">
                                "{DEFAULT_VOICE_SAMPLE}"
                            </p>
                        </div>
                    </motion.div>
                ) : null}

                {/* Action Button */}
                <div className="flex gap-2">
                    <Button
                        onClick={onRegenerate}
                        disabled={isGenerating || !generatedContent}
                        variant={BUTTON_VARIANT.OUTLINE}
                        className="flex-1"
                    >
                        {isGenerating ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <RotateCcw className="w-4 h-4" />
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}