export const API_OPERATIONS = {
  ANALYZING: 'analyzing',
  GENERATING_IMAGE: 'generatingImage',
  GENERATING_VOICE: 'generatingVoice',
  GENERATING_MUSIC: 'generatingMusic'
};

export const API_ENDPOINTS = {
  ANALYZE_CHARACTER: '/analyze-character',
  GENERATE_IMAGE: '/generate-image',
  GENERATE_VOICE: '/generate-voice',
  GENERATE_MUSIC: '/generate-music'
};

export const ERROR_MESSAGES = {
  [API_OPERATIONS.ANALYZING]: 'Failed to analyze character. Check backend logs.',
  [API_OPERATIONS.GENERATING_IMAGE]: 'Failed to generate image.',
  [API_OPERATIONS.GENERATING_VOICE]: 'Failed to generate voice.',
  [API_OPERATIONS.GENERATING_MUSIC]: 'Failed to generate music.'
};