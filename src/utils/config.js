export const SITE_CONFIG = {
    'chatgpt.com': {
        promptSelector: '#prompt-textarea',
        getPrompt: (element) => element.innerText,
        sendButtonSelector: 'button[data-testid="send-button"]',
        responseSelector: 'div[data-message-author-role="assistant"]',
        model: 'GPT-4o',

    },
    'claude.ai': {
        promptSelector: 'div.ProseMirror',
        getPrompt: (element) => element.textContent || element.innerText || "",
        sendButtonSelector: 'button[aria-label="Send message"]',
        responseSelector: '.font-claude-response',
        model: 'Claude 4.6 Opus',
    },
    'gemini.google.com': {
        promptSelector: 'div[contenteditable="true"][role="textbox"], rich-textarea div[contenteditable="true"]',
        getPrompt: (element) => element.innerText,
        sendButtonSelector: 'button[aria-label="Send message"]',
        responseSelector: '.model-response-text',
        model: 'Gemini 3 Pro'
    },
    'chat.deepseek.com': {
        promptSelector: 'textarea[placeholder="Message DeepSeek"]',
        getPrompt: (element) => element.value,
        sendButtonSelector: '._52c986b', //may need a better anchor than this. I think this is from a shadow DOM
        responseSelector: '.ds-markdown', 
        model: 'DeepSeek V3'
    },
    'grok.com': {
        promptSelector: 'div[contenteditable="true"]',
        getPrompt: (element) => element.innerText,
        sendButtonSelector: 'button[aria-label="Submit"]',
        responseSelector: 'div[id^="response-"]', //transparent my fucking ass elon ts was not easy to identify
        model: 'Grok 4.1'
    },
    'meta.ai': {
        promptSelector: 'div[contenteditable="true"]',
        getPrompt: (element) => element.innerText || "", 
        sendButtonSelector: 'button[aria-label="Send"]',
        responseSelector: 'div[data-testid="assistant-message"]',
        model: 'Llama 4'
    }
};

export const MODEL_CONFIG = {
  "GPT-4o": {
    provider: "OpenAI",
    likelyZone: "US-MIDA-PJM",
    //likelyZone: Not all of them is public information so these are my best guesses
    energyPerToken: 0.000002,
    //energyPerToken: I'm not smart enough to get definitive values, so I'm using approximations
  },

  "Claude 4.6 Opus": {
    provider: "Anthropic",
    likelyZone: "US-NW-BPAT",
    energyPerToken: 0.000002,
  },

  "Gemini 3 Pro": {
    provider: "Google",
    likelyZone: "US-MIDW-MISO",
    energyPerToken: 0.0000015,
  },

  "DeepSeek V3": {
    provider: "DeepSeek",
    likelyZone: "CN-NORTH",
    energyPerToken: 0.0000005,
    fallbackIntensity: 550,
  },

  "Grok 4.1": {
    provider: "xAI",
    likelyZone: "US-TEN-TVA",
    energyPerToken: 0.0000025,
  },

  "Llama 4": {
    provider: "Meta",
    likelyZone: "US-TEX-ERCO",
    energyPerToken: 0.0000015,
  },
};