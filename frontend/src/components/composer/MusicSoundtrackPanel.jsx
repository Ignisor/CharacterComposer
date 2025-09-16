import React from 'react';
import { Music, RotateCcw, Loader2 } from "lucide-react";
import { BUTTON_VARIANT } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";

export default function MusicSoundtrackPanel({
  characterTitle,
  generatedContent,
  isGenerating,
  onRegenerate,
}) {
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
                  <audio controls src={generatedContent} title={`${characterTitle}_music_theme`}></audio>
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
              </div>
            </CardContent>
        </Card>
    );
}