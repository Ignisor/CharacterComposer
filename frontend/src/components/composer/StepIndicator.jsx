import React from 'react';
import { motion } from "framer-motion";
import { FileText, Settings, Sparkles } from "lucide-react";
import {COMPOSER_STEPS} from "../../constants/stepper";

const steps = [
    {
      id: COMPOSER_STEPS.BASE_CONFIG,
      name: "Input Text",
      icon: FileText,
    },
    {
      id: COMPOSER_STEPS.ADVANCED_CONFIG,
      name: "Customize Traits",
      icon: Settings,
    },
    {
      id: COMPOSER_STEPS.RESULT,
      name: "Generate Content",
      icon: Sparkles,
    }
];

export default function StepIndicator({ currentStep }) {
    return (
        <div className="flex justify-center mb-12">
            <div className="flex items-center gap-4">
                {steps.map((step, index) => (
                    <div key={step.id} className="flex items-center">
                        <motion.div
                            className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all ${
                                currentStep >= step.id
                                    ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white glow-border'
                                    : 'bg-white/10 text-white/40 border border-white/20'
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <step.icon className="w-5 h-5" />
                            {currentStep > step.id && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute inset-0 bg-green-500 rounded-full flex items-center justify-center"
                                >
                                    <Sparkles className="w-4 h-4 text-white" />
                                </motion.div>
                            )}
                        </motion.div>

                        <div className="ml-3 mr-6">
                            <p className={`text-sm font-medium ${
                                currentStep >= step.id ? 'text-white' : 'text-white/40'
                            }`}>
                                Step {step.id}
                            </p>
                            <p className={`text-xs ${
                                currentStep >= step.id ? 'text-purple-300' : 'text-white/30'
                            }`}>
                                {step.name}
                            </p>
                        </div>

                        {index < steps.length - 1 && (
                            <div className={`w-12 h-0.5 ${
                                currentStep > step.id ? 'bg-gradient-to-r from-purple-500 to-cyan-500' : 'bg-white/20'
                            }`} />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}