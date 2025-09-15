import axios from 'axios';
import { API_ENDPOINTS } from '../constants/api';

class CharacterAPI {
  async analyzeCharacter(text) {
    const response = await axios.post(API_ENDPOINTS.ANALYZE_CHARACTER, { text });
    return response.data;
  }

  async generateImage(visualPrompt) {
    const response = await axios.post(API_ENDPOINTS.GENERATE_IMAGE, { 
      prompt: visualPrompt 
    });
    return response.data.image;
  }

  async generateVoice(text, voiceTraits) {
    const response = await axios.post(API_ENDPOINTS.GENERATE_VOICE, { 
      text, 
      voice_traits: voiceTraits 
    });
    return response.data.voice_options;
  }

  async generateMusic(mood) {
    const response = await axios.post(API_ENDPOINTS.GENERATE_MUSIC, { mood });
    return response.data.music || response.data.error;
  }
}

export const characterAPI = new CharacterAPI();