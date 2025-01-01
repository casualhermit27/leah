// Create a new file for model configuration
export const MODEL_CONFIG = {
  llama2: {
    baseUrl: 'http://localhost:11434',
    headers: {
      'Content-Type': 'application/json',
    },
    defaultParams: {
      temperature: 0.7,
      top_p: 0.95,
      top_k: 40,
      repeat_penalty: 1.1,
      max_tokens: 1024,
      num_thread: 8
    }
  },
  finbert: {
    baseUrl: 'http://localhost:11434',
    headers: {
      'Content-Type': 'application/json',
    },
    defaultParams: {
      temperature: 0.7,
      top_p: 0.95,
      top_k: 40,
      repeat_penalty: 1.1,
      max_tokens: 512,
      num_thread: 8
    }
  },
  pubmedbert: {
    baseUrl: 'http://localhost:11434',
    headers: {
      'Content-Type': 'application/json',
    },
    defaultParams: {
      temperature: 0.3,
      top_p: 0.95,
      top_k: 40,
      repeat_penalty: 1.1,
      max_tokens: 512,
      num_thread: 8
    }
  }
};

export const checkModelAvailability = async (modelName) => {
  try {
    const response = await fetch(`http://localhost:11434/api/tags`);
    const data = await response.json();
    return data.models.some(model => model.name === modelName);
  } catch (error) {
    console.error(`Error checking model availability: ${error}`);
    return false;
  }
}; 