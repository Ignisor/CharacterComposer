import React, { useState } from "react";
import { Button, BUTTON_VARIANT } from "./components/ui/button";
import { ArrowLeft, ArrowRight, Sparkles, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import TextInputPanel from "./components/composer/TextInputPanel";
import TraitSummary from "./components/composer/TraitSummary";
import GenerationPanels from "./components/composer/GenerationPanels";
import StepIndicator from "./components/composer/StepIndicator";
import {COMPOSER_STEPS} from "./constants/stepper";
import {useApiLoading} from "./hooks/useApiLoading";

// FIXME: add traits to steps 2 and 3

export default function CharacterComposer() {
  const [currentStep, setCurrentStep] = useState(COMPOSER_STEPS.BASE_CONFIG);
  const [characterTitle, setCharacterTitle] = useState('');
  const [traits, setTraits] = useState(null);
  const [image, setImage] = useState(null);
  const [voiceOptions, setVoiceOptions] = useState(null);
  const [music, setMusic] = useState(null);

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
    const voiceText = "A new hand touches the beacon. Listen. Hear me and obey. A foul darkness has seeped into my temple. A darkness that you will destroy.";
    await apiWithLoading.generateVoice(voiceText, updatedTraits.voice_traits, setVoiceOptions);
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

  const onDownloadImage = () => {};

  const onDownloadMusic = () => {};

  const onDownloadVoice = () => {};

  const nextStep = () => {
      if (currentStep < COMPOSER_STEPS.RESULT) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
      if (currentStep > COMPOSER_STEPS.BASE_CONFIG) setCurrentStep(currentStep - 1);
  };

  const resetWorkflow = () => {
      setCurrentStep(COMPOSER_STEPS.BASE_CONFIG);
      setTraits(null);
      setImage(null);
      setVoiceOptions(null);
      setMusic(null);
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
                        onDownloadMusic={onDownloadMusic}
                        onDownloadVoice={onDownloadVoice}
                      />
                  )}
              </AnimatePresence>
          </div>
      </div>
  );
}