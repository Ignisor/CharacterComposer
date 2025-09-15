import React, { useState } from 'react';
import { motion } from "framer-motion";
import {
  Mic,
  Play,
  Pause,
  Volume2,
  RotateCcw,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import {BUTTON_VARIANT} from "../ui/button";

export default function VoicePlaybackPanel({
  generatedContent,
  isGenerating,
  onRegenerate,
  onDownloadVoice,
}) {
    const [isPlaying, setIsPlaying] = useState(false);

    const handlePlay = () => {
        setIsPlaying(!isPlaying);
    };
    

    const renderWaveform = () => {
        if (!generatedContent?.waveform) return null;

        return (
            <div className="flex items-center justify-center h-20 gap-1">
                {generatedContent.waveform.map((height, index) => (
                    <motion.div
                        key={index}
                        className="bg-cyan-400 rounded-full w-1"
                        style={{ height: `${height}%` }}
                        animate={{
                            height: isPlaying ? [`${height}%`, `${Math.random() * 100}%`, `${height}%`] : `${height}%`
                        }}
                        transition={{
                            duration: 0.5,
                            delay: index * 0.02,
                            repeat: isPlaying ? Infinity : 0,
                        }}
                    />
                ))}
            </div>
        );
    };

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
                {generatedContent ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4"
                    >
                        {/* Voice Profile */}
                        <div className="bg-white/5 rounded-lg p-3">
                            <p className="text-xs text-white/60 mb-1">Voice Profile:</p>
                            <p className="text-sm font-medium text-cyan-300">{generatedContent.voiceProfile}</p>
                        </div>

                        {/* Sample Dialogue */}
                        <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg p-4">
                            <p className="text-xs text-white/60 mb-2">Sample Dialogue:</p>
                            <p className="text-white italic text-center">
                                "{generatedContent.dialogue}"
                            </p>
                        </div>

                        {/* Waveform Visualization */}
                        <div className="bg-black/20 rounded-lg p-4">
                            {renderWaveform()}
                        </div>

                        {/* Audio Controls */}
                        <div className="flex items-center justify-center gap-4">
                            <Button
                                onClick={handlePlay}
                                className="w-12 h-12 rounded-full glow-button"
                            >
                                {isPlaying ? (
                                    <Pause className="w-5 h-5" />
                                ) : (
                                    <Play className="w-5 h-5" />
                                )}
                            </Button>
                            <div className="flex items-center gap-2 text-white/60">
                                <Volume2 className="w-4 h-4" />
                                <div className="w-16 h-1 bg-white/20 rounded-full">
                                    <div className="w-3/4 h-full bg-cyan-400 rounded-full" />
                                </div>
                            </div>
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