//Get prompt editable div / textarea content
import { SITE_CONFIG } from "../utils/config";

const hostname = window.location.hostname;
const siteConfig = SITE_CONFIG[hostname];

let responseTimer = null;
let lastSnipedText = "";
let lastSubmitTime = 0;
let waitingForResponse = false;

let livePromptText = "";

if (!siteConfig) {
  console.log("PromptFootprint: Site not supported, going to sleep.");
}

const trigger = (promptText) => {
  if (Date.now() - lastSubmitTime < 1000) return;
  lastSubmitTime = Date.now();

  if (promptText && promptText.trim().length > 0) {
    waitingForResponse = true;
    livePromptText = "";

    console.log("PromptFootprint: Sending message to background engine...");
    chrome.runtime.sendMessage(
      {
        type: "CALCULATE_FOOTPRINT",
        promptText,
        model: siteConfig.model,
      },
      (response) => {
        //crash prevention
        if (chrome.runtime.lastError) {
          console.log("PromptFootprint: Engine asleep or disconnected");
          return;
        }
        console.log("PromptFootprint: Calculation Received", response);
      },
    );
  } else {
    console.log("PromptFootprint: Aborted. Empty text box");
  }    
};

const snipeOutput = () => {
  if (!waitingForResponse) return;
  const responses = document.querySelectorAll(siteConfig.responseSelector); //grab all of them in case there is multiple on screen
  if (responses.length === 0) return;

  const latestResponse = responses[responses.length - 1];
  const responseText = latestResponse.innerText;

  if (responseText === lastSnipedText || responseText.trim().length === 0) return;
  lastSnipedText = responseText;

  console.log("PromptFootprint: Thinks AI is done talking. Output length: ", responseText.length);
  waitingForResponse = false;

  chrome.runtime.sendMessage(
    {
      type: "CALCULATE_OUTPUT_FOOTPRINT",
      responseText,
      model: siteConfig.model,
    },
    (response) => {
      if (chrome.runtime.lastError) {
        console.log("PromptFootprint: Engine asleep or disconnected");
        return;
      }
      console.log("PromptFootprint: Calculation Received", response);
    },
  );
};

const observer = new MutationObserver(() => {
  if (siteConfig && siteConfig.responseSelector) {
    //debouncer
    clearTimeout(responseTimer);
    responseTimer = setTimeout(() => {
      snipeOutput()
    }, 3000) //3 seconds is safe i think?
  }
});

if (siteConfig) {
  //changing approach since the other one didn't work
  document.body.addEventListener("input", (event) => {
    const promptBox = event.target.closest(siteConfig.promptSelector);
    if (promptBox) {
      livePromptText = siteConfig.getPrompt(promptBox);
    }
  }, { capture: true });

  document.body.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      const promptBox = event.target.closest(siteConfig.promptSelector);
      if (promptBox) {
        let promptText = siteConfig.getPrompt(promptBox);
        if (!promptText || promptText.trim() === "") promptText = livePromptText;
        trigger(promptText);
      }
    }
  }, { capture: true });

  if (siteConfig.sendButtonSelector) {
    document.body.addEventListener("mousedown", (event) => {
      //so it also works when you click the button. 4/16/26 Casey: moved this so script doesn't run anytime you click anything on any website.. god how did i not realize that the first time
      const likelySendButton = event.target.closest(siteConfig.sendButtonSelector);
      if (likelySendButton) {
        let promptText = livePromptText;

        //in case framework starts putting dom elements all over the place
        const possiblePromptInputs = Array.from(document.querySelectorAll(siteConfig.promptSelector));
        const visibleInputs = possiblePromptInputs.filter(element => element.getBoundingClientRect().height > 0);

        if (visibleInputs.length > 0) {
          const directText = siteConfig.getPrompt(visibleInputs[visibleInputs.length -1]);
          if (directText && directText.trim() !== "") promptText = directText;
        }

        trigger(promptText);
      }
    }, { capture: true });
  }

  if (siteConfig.responseSelector) {
    observer.observe(document.body, { childList: true, subtree: true, characterData: true});
  }
}


