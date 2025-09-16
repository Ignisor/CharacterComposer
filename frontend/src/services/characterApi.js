import axios from 'axios';
import { API_ENDPOINTS } from '../constants/api';

class CharacterAPI {
  async analyzeCharacter(text) {
    const payload = typeof text === 'string' ? { text } : text;
    const response = await axios.post(API_ENDPOINTS.ANALYZE_CHARACTER, payload);
    return response.data.character_profile;
  }

  async generateImage(characterProfile) {
    const response = await axios.post(API_ENDPOINTS.GENERATE_IMAGE, {
      character_profile: characterProfile,
      options: { intent: 'portrait' }
    });
    return response.data.image;
  }

  async generateVoice(characterProfile, text) {
    const payload = { character_profile: characterProfile };
    if (typeof text === 'string' && text.trim().length > 0) {
      payload.text = text.trim();
    }
    const response = await axios.post(API_ENDPOINTS.GENERATE_VOICE, payload);
    return response.data;
  }

  async generateMusic(mood) {
    const response = await axios.post(API_ENDPOINTS.GENERATE_MUSIC, { mood });
    return response.data.music;
  }
}

export const characterAPI = new CharacterAPI();