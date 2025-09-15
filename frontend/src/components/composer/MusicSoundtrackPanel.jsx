import React, { useState } from 'react';
import { motion } from "framer-motion";
import {
  Music,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  RotateCcw,
  Loader2, Download
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import {BUTTON_VARIANT} from "../ui/button";

export default function MusicSoundtrackPanel({
  generatedContent,
  isGenerating,
  onRegenerate,
  onDownloadMusic,
}) {
    const [isPlaying, setIsPlaying] = useState(false);

    const handlePlay = () => {
        setIsPlaying(!isPlaying);
    };

    return (
        <Card className="glass-card glow-border h-fit">
            <CardHeader>
                <CardTitle className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                            <Music className="w-5 h-5 text-white" />
                        </div>
                        Character Theme
                    </div>
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Music Generation Status */}
                {generatedContent ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4"
                    >
                        {/* Audio Visualizer */}
                        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-lg p-6">
                            <div className="flex justify-center items-center h-16">
                                {Array.from({ length: 12 }, (_, i) => (
                                    <motion.div
                                        key={i}
                                        className="mx-1 bg-gradient-to-t from-amber-400 to-orange-400 rounded-full w-2"
                                        style={{ height: '20px' }}
                                        animate={{
                                            height: isPlaying
                                                ? [20, Math.random() * 50 + 10, 20]
                                                : 20
                                        }}
                                        transition={{
                                            duration: 0.8,
                                            repeat: isPlaying ? Infinity : 0,
                                            delay: i * 0.1,
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Music Controls */}
                        <div className="flex items-center justify-center gap-4">
                            <Button size="icon" variant={BUTTON_VARIANT.GHOST}>
                                <SkipBack className="w-4 h-4" />
                            </Button>
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
                            <Button size="icon" variant={BUTTON_VARIANT.GHOST}>
                                <SkipForward className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Volume Control */}
                        <div className="flex items-center justify-center gap-2">
                            <Volume2 className="w-4 h-4 text-white/60" />
                            <div className="w-24 h-1 bg-white/20 rounded-full">
                                <div className="w-2/3 h-full bg-amber-400 rounded-full" />
                            </div>
                        </div>
                    </motion.div>
                ) : null}

              {/* Action Buttons */}
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
                <Button
                  onClick={onDownloadMusic}
                  disabled={!generatedContent}
                  variant={BUTTON_VARIANT.OUTLINE}
                  className="flex-1"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
        </Card>
    );
}