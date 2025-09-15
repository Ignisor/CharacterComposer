import { useState } from 'react';
import { characterAPI } from '../services/characterApi';
import { API_OPERATIONS, ERROR_MESSAGES } from '../constants/api';

export const useApiLoading = () => {
  const [loadingStates, setLoadingStates] = useState({
    [API_OPERATIONS.ANALYZING]: false,
    [API_OPERATIONS.GENERATING_IMAGE]: false,
    [API_OPERATIONS.GENERATING_VOICE]: false,
    [API_OPERATIONS.GENERATING_MUSIC]: false
  });

  // Common error display function
  const showError = (operation, error) => {
    console.error(`${operation} error:`, error);
    const errorMessage = ERROR_MESSAGES[operation] || 'An unexpected error occurred.';
    alert(`❌ ${errorMessage}`);
  };

  // Generic makeRequest function with loading and error handling
  const makeRequest = async (operation, requestFn, onSuccess) => {
    setLoadingStates(prev => ({ ...prev, [operation]: true }));
    
    try {
      const result = await requestFn();
      onSuccess(result);
      return { success: true, data: result };
    } catch (error) {
      showError(operation, error);
      return { success: false, error };
    } finally {
      setLoadingStates(prev => ({ ...prev, [operation]: false }));
    }
  };

  // API methods using makeRequest pattern
  const apiWithLoading = {
    analyzeCharacter: (text, onSuccess) => {
      return makeRequest(
        API_OPERATIONS.ANALYZING,
        () => characterAPI.analyzeCharacter(text),
        onSuccess
      );
    },

    generateImage: (prompt, onSuccess) => {
      return makeRequest(
        API_OPERATIONS.GENERATING_IMAGE,
        () => characterAPI.generateImage(prompt),
        onSuccess
      );
    },

    generateVoice: (traits, onSuccess) => {
      return makeRequest(
        API_OPERATIONS.GENERATING_VOICE,
        () => characterAPI.generateVoice(traits),
        onSuccess
      );
    },

    generateMusic: (mood, onSuccess) => {
      return makeRequest(
        API_OPERATIONS.GENERATING_MUSIC,
        () => characterAPI.generateMusic(mood),
        onSuccess
      );
    }
  };

  return { loadingStates, apiWithLoading };
};