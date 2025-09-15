import React from 'react';
import { motion } from "framer-motion";
import { Button, BUTTON_VARIANT } from "../ui/button";
import { RotateCcw, Loader2 } from "lucide-react";

import {API_OPERATIONS} from "../../constants/api";
import CharacterImagePanel from "./CharacterImagePanel";
import VoicePlaybackPanel from "./VoicePlaybackPanel";
import MusicSoundtrackPanel from "./MusicSoundtrackPanel";

export default function GenerationPanels({
  image,
  voiceOptions,
  music,
  loadingStates,
  isAnyLoading,
  onRegenerateAll,
  onRegenerateImage,
  onRegenerateVoice,
  onRegenerateMusic,
  onDownloadImage,
  onDownloadMusic,
  onDownloadVoice,
}) {
    return (
        <motion.div
            key="generation-panels"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-7xl mx-auto"
        >
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Generated Content</h2>
                <p className="text-white/60">Your character brought to life</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Character Image Panel */}
                <CharacterImagePanel
                  generatedContent={image}
                  isGenerating={loadingStates[API_OPERATIONS.GENERATING_IMAGE]}
                  onRegenerate={onRegenerateImage}
                  onDownloadImage={onDownloadImage}
                />

                {/* Voice Playback Panel */}
                <VoicePlaybackPanel
                  generatedContent={voiceOptions}
                  isGenerating={loadingStates[API_OPERATIONS.GENERATING_VOICE]}
                  onRegenerate={onRegenerateVoice}
                  onDownloadVoice={onDownloadVoice}
                />

                {/* Music Soundtrack Panel */}
                <MusicSoundtrackPanel
                  generatedContent={music}
                  isGenerating={loadingStates[API_OPERATIONS.GENERATING_MUSIC]}
                  onRegenerate={onRegenerateMusic}
                  onDownloadMusic={onDownloadMusic}
                />
            </div>

            {/* Regenerate All Button */}
            <div className="text-center mt-8">
                <Button
                    onClick={onRegenerateAll}
                    disabled={isAnyLoading}
                    variant={BUTTON_VARIANT.OUTLINE}
                >
                    {isAnyLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Regenerate All Content
                        </>
                    )}
                </Button>
            </div>
        </motion.div>
    );
}