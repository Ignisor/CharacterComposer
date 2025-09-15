import React, { useState } from "react";
import { Button, BUTTON_VARIANT } from "./components/ui/button";
import { ArrowLeft, ArrowRight, Sparkles, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { COMPOSER_STEPS } from "./constants/stepper";
import { useApiLoading } from "./hooks/useApiLoading";
import TextInputPanel from "./components/composer/TextInputPanel";
import TraitSummary from "./components/composer/TraitSummary";
import GenerationPanels from "./components/composer/GenerationPanels";
import StepIndicator from "./components/composer/StepIndicator";

export default function CharacterComposer() {
  const [currentStep, setCurrentStep] = useState(COMPOSER_STEPS.BASE_CONFIG);
  const [characterTitle, setCharacterTitle] = useState('');
  const [traits, setTraits] = useState(null);
  const [image, setImage] = useState('');
  const [voiceOptions, setVoiceOptions] = useState([]);
  const [music, setMusic] = useState('');

  const { loadingStates, apiWithLoading } = useApiLoading();

  const isAnyLoading = Object.values(loadingStates).some(loading => loading);

  const onTextAnalysis = async (textContent) => {
      await apiWithLoading.analyzeCharacter(textContent, (data) => {
        setTraits(data);
        setCurrentStep(COMPOSER_STEPS.ADVANCED_CONFIG);
      });
    };

  const onGenerateImage = async (updatedTraits) => {
    await apiWithLoading.generateImage(updatedTraits.visual_prompt, setImage);
  };

  const onGenerateVoice = async (updatedTraits) => {
    await apiWithLoading.generateVoice(updatedTraits.voice_traits, setVoiceOptions);
  }

  const onGenerateMusic = async (updatedTraits) => {
    await apiWithLoading.generateMusic(updatedTraits.music_mood, setMusic);
  }

  const onGenerateCharacter = async (updatedTraits) => {
    await onGenerateImage(updatedTraits);
    await onGenerateVoice(updatedTraits);
    await onGenerateMusic(updatedTraits);

    setTraits(updatedTraits);
    setCurrentStep(COMPOSER_STEPS.RESULT);
  };

  const onDownloadImage = async () => {
    if (!image) {
      console.warn('No image available to download');
      return;
    }

    try {
      const response = await fetch(image);
      if (!response.ok) {
        throw new Error('Failed to fetch image');
      }

      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      link.download = characterTitle
        ? `${characterTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.png`
        : `character_image_${timestamp}.png`;
      
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const nextStep = () => {
      if (currentStep < COMPOSER_STEPS.RESULT) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
      if (currentStep > COMPOSER_STEPS.BASE_CONFIG) setCurrentStep(currentStep - 1);
  };

  const resetWorkflow = () => {
      setCurrentStep(COMPOSER_STEPS.BASE_CONFIG);
      setCharacterTitle('');
      setTraits(null);
      setImage('');
      setVoiceOptions([]);
      setMusic('');
    };

  return (
      <div className="min-h-screen p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="text-center mb-8">
                  <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-center gap-3 mb-4"
                  >
                      <Sparkles className="w-8 h-8 text-purple-400" />
                      <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                          Character Composer
                      </h1>
                  </motion.div>
                  <p className="text-white/60 text-lg max-w-2xl mx-auto">
                      Transform your character descriptions into stunning visuals, voice, and music
                  </p>
              </div>

              {/* Step Indicator */}
              <StepIndicator currentStep={currentStep} />

              {/* Workflow Navigation */}
              <div className="flex justify-between items-center mb-8">
                  <Button
                      variant={BUTTON_VARIANT.GHOST}
                      onClick={prevStep}
                      disabled={currentStep === COMPOSER_STEPS.BASE_CONFIG}
                  >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Previous
                  </Button>

                  <Button variant={BUTTON_VARIANT.GHOST} onClick={resetWorkflow}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Start Over
                  </Button>

                  <Button
                    variant={BUTTON_VARIANT.GHOST}
                    onClick={nextStep}
                    disabled={currentStep === COMPOSER_STEPS.RESULT || !traits}
                  >
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
              </div>

              {/* Step Content */}
              <AnimatePresence mode="wait">
                  {currentStep === COMPOSER_STEPS.BASE_CONFIG && (
                      <TextInputPanel
                          onAnalyze={onTextAnalysis}
                          isGenerating={isAnyLoading}
                          characterTitle={characterTitle}
                          setCharacterTitle={setCharacterTitle}
                      />
                  )}

                  {currentStep === COMPOSER_STEPS.ADVANCED_CONFIG && !!traits && (
                      <TraitSummary
                        traits={traits}
                        onUpdate={onGenerateCharacter}
                        isLoading={isAnyLoading}
                      />
                  )}

                  {currentStep === COMPOSER_STEPS.RESULT && !!traits && (
                      <GenerationPanels
                        traits={traits}
                        image={image}
                        voiceOptions={voiceOptions}
                        music={music}
                        loadingStates={loadingStates}
                        isAnyLoading={isAnyLoading}
                        onRegenerateAll={async () => onGenerateCharacter(traits)}
                        onRegenerateImage={async () => onGenerateImage(traits)}
                        onRegenerateVoice={async () => onGenerateVoice(traits)}
                        onRegenerateMusic={async () => onGenerateMusic(traits)}
                        onDownloadImage={onDownloadImage}
                      />
                  )}
              </AnimatePresence>
          </div>
      </div>
  );
}