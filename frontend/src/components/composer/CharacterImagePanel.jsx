import React from 'react';
import { motion } from "framer-motion";
import { Image, Download, RotateCcw, Loader2, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {Button, BUTTON_VARIANT} from "../ui/button";

export default function CharacterImagePanel({
  generatedContent,
  isGenerating,
  onRegenerate,
  onDownloadImage,
}) {
    return (
        <Card className="glass-card glow-border h-fit">
            <CardHeader>
                <CardTitle className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                            <Image className="w-5 h-5 text-white" />
                        </div>
                        Character Image
                    </div>
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Image Display */}
                <div className="aspect-[3/4] bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl overflow-hidden relative">
                    {generatedContent ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative h-full"
                        >
                            <img
                                src={generatedContent.url}
                                alt="Chacharacter Image"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                            <div className="absolute bottom-4 left-4 right-4">
                                <div className="flex items-center gap-2 text-white text-sm">
                                    <Eye className="w-4 h-4" />
                                    <span className="font-medium">AI Generated</span>
                                </div>
                            </div>
                        </motion.div>
                    ) : null}
                </div>

                {/* Prompt Preview */}
                {generatedContent && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white/5 rounded-lg p-3"
                    >
                        <p className="text-xs text-white/60 mb-1">Generation Prompt:</p>
                        <p className="text-sm text-white/80 line-clamp-3">{generatedContent.prompt}</p>
                    </motion.div>
                )}

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
                        onClick={onDownloadImage}
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