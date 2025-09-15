import React, { useState } from "react";
import CharacterProject from "./entities/CharacterProject";
import { Button, BUTTON_VARIANT } from "./components/ui/button";
import { ArrowLeft, ArrowRight, Sparkles, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import TextInputPanel from "./components/composer/TextInputPanel";
// import TraitSummary from "./components/composer/TraitSummary";
// import GenerationPanels from "./components/composer/GenerationPanels";
import StepIndicator from "./components/composer/StepIndicator";
import {COMPOSER_STEPS} from "./utils/stepper";

export default function CharacterComposer() {
    const [currentStep, setCurrentStep] = useState(COMPOSER_STEPS.BASE_CONFIG);
    const [project, setProject] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleTextAnalysis = async (textData) => {
        setIsGenerating(true);
        try {
            // Simulate AI analysis delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Create new project with analyzed traits
            const newProject = await CharacterProject.create({
                ...textData,
                visual_traits: {
                    age: "Mid-twenties",
                    gender: "Female",
                    physique: "Tall and athletic",
                    hair_color: "Raven black",
                    eye_color: "Emerald green",
                    clothing_style: "Dark leather armor with silver accents",
                    distinctive_features: "Scar across left cheek, glowing pendant"
                },
                vocal_traits: {
                    voice_type: "Contralto",
                    accent: "Slight elvish lilt",
                    tone: "Confident and mysterious",
                    pace: "Measured and deliberate",
                    sample_dialogue: "The shadows whisper secrets that daylight cannot hear."
                },
                mood_atmosphere: {
                    primary_mood: "Mysterious",
                    genre: "Dark Fantasy",
                    energy_level: "Medium-low",
                    instruments: "Strings, ambient pads, ethereal vocals"
                },
                current_step: 2
            });

            setProject(newProject);
            setCurrentStep(COMPOSER_STEPS.ADVANCED_CONFIG);
        } catch (error) {
            console.error("Error creating project:", error);
        }
        setIsGenerating(false);
    };

    const handleTraitUpdate = async (updatedTraits) => {
        if (!project) return;

        const updatedProject = await CharacterProject.update(project.id, {
            ...updatedTraits,
            current_step: 3
        });
        setProject(updatedProject);
        setCurrentStep(COMPOSER_STEPS.RESULT);
    };

    const nextStep = () => {
        if (currentStep < COMPOSER_STEPS.RESULT) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > COMPOSER_STEPS.BASE_CONFIG) setCurrentStep(currentStep - 1);
    };

    const resetWorkflow = () => {
        setCurrentStep(COMPOSER_STEPS.BASE_CONFIG);
        setProject(null);
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
                      disabled={currentStep === COMPOSER_STEPS.RESULT || !project}
                    >
                        Next
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>

                {/* Step Content */}
                <AnimatePresence mode="wait">
                    {currentStep === COMPOSER_STEPS.BASE_CONFIG && (
                        <TextInputPanel
                            onAnalyze={handleTextAnalysis}
                            isGenerating={isGenerating}
                        />
                    )}

                {/*    {currentStep === COMPOSER_STEPS.ADVANCED_CONFIG && project && (*/}
                {/*        <TraitSummary*/}
                {/*            project={project}*/}
                {/*            onUpdate={handleTraitUpdate}*/}
                {/*        />*/}
                {/*    )}*/}

                {/*    {currentStep === COMPOSER_STEPS.RESULT && project && (*/}
                {/*        <GenerationPanels project={project} />*/}
                {/*    )}*/}
                </AnimatePresence>
            </div>
        </div>
    );
}