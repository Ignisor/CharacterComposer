import React, { useState } from "react";
import { Button, BUTTON_VARIANT } from "./components/ui/button";
import { ArrowLeft, ArrowRight, Sparkles, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { COMPOSER_STEPS } from "./constants/stepper";
import { DEFAULT_VOICE_SAMPLE } from "./constants/traits";
import { useApiLoading } from "./hooks/useApiLoading";
import TextInputPanel from "./components/composer/TextInputPanel";
import TraitSummary from "./components/composer/TraitSummary";
import GenerationPanels from "./components/composer/GenerationPanels";
import StepIndicator from "./components/composer/StepIndicator";

export default function CharacterComposer() {
  const [currentStep, setCurrentStep] = useState(COMPOSER_STEPS.BASE_CONFIG);
  const [characterTitle, setCharacterTitle] = useState('');
  const [profile, setProfile] = useState(null);
  const [image, setImage] = useState('');
  const [voiceOptions, setVoiceOptions] = useState([]);
  const [voiceTextUsed, setVoiceTextUsed] = useState(DEFAULT_VOICE_SAMPLE);
  const [music, setMusic] = useState('');

  const { loadingStates, apiWithLoading } = useApiLoading();

  const isAnyLoading = Object.values(loadingStates).some(loading => loading);
  const downloadCharacterTitle = characterTitle ? characterTitle.replace(/[^a-zA-Z0-9]/g, '_') : 'character';

  const onTextAnalysis = async (textContent) => {
    await apiWithLoading.analyzeCharacter(textContent, (characterProfile) => {
      setProfile(characterProfile);
      setCurrentStep(COMPOSER_STEPS.ADVANCED_CONFIG);
    });
  };

  const onGenerateImage = async (updatedProfile) => {
    await apiWithLoading.generateImage(updatedProfile, setImage);
  };

  const onGenerateVoice = async (updatedProfile) => {
    await apiWithLoading.generateVoice(updatedProfile, voiceTextUsed, (data) => {
      setVoiceOptions(data.voice_options || []);
      setVoiceTextUsed(data.text_used || '');
    });
  }

  const onGenerateMusic = async (updatedProfile) => {
    await apiWithLoading.generateMusic(updatedProfile.music_mood, setMusic);
  }

  const onGenerateCharacter = async (updatedProfile) => {
    await onGenerateImage(updatedProfile);
    await onGenerateVoice(updatedProfile, voiceTextUsed);
    await onGenerateMusic(updatedProfile);

    setProfile(updatedProfile);
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
      link.download = `${downloadCharacterTitle}_image.png`;

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
    setProfile(null);
    setImage('');
    setVoiceOptions([]);
    setVoiceTextUsed(DEFAULT_VOICE_SAMPLE);
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
            disabled={currentStep === COMPOSER_STEPS.RESULT || !profile}
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

          {currentStep === COMPOSER_STEPS.ADVANCED_CONFIG && !!profile && (
            <TraitSummary
              traits={profile}
              onUpdate={onGenerateCharacter}
              isLoading={isAnyLoading}
              voiceTextUsed={voiceTextUsed}
              setVoiceTextUsed={setVoiceTextUsed}
            />
          )}

          {currentStep === COMPOSER_STEPS.RESULT && !!profile && (
            <GenerationPanels
              characterTitle={downloadCharacterTitle}
              traits={profile}
              image={image}
              voiceOptions={voiceOptions}
              voiceTextUsed={voiceTextUsed}
              music={music}
              loadingStates={loadingStates}
              isAnyLoading={isAnyLoading}
              onRegenerateAll={async () => onGenerateCharacter(profile)}
              onRegenerateImage={async () => onGenerateImage(profile)}
              onRegenerateVoice={async () => onGenerateVoice(profile)}
              onRegenerateMusic={async () => onGenerateMusic(profile)}
              onDownloadImage={onDownloadImage}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}