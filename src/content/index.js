//Get prompt editable div / textarea content
import { SITE_CONFIG } from "../utils/config";

let currentPromptInput = null;

const handlePromptSubmit = (event) => {
  if (event.type === "keydown" && (event.key !== "Enter" || event.shiftKey)) {
    return;
  }

  const hostname = window.location.hostname;
  const siteConfig = SITE_CONFIG[hostname];

  if (!siteConfig) return;

  const promptText = siteConfig.getPrompt(currentPromptInput);

  if (promptText && promptText.trim().length > 0) {
    console.log("PromptFootprint: Sending message to background engine...");
    chrome.runtime.sendMessage(
      {
        //send to background
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
        //remember to update popup later
        
      },
    );
  } else {
    console.log("PromptFootprint: Aborted. Empty text box");
  }
};

const initListener = () => {
  const hostname = window.location.hostname;
  const siteConfig = SITE_CONFIG[hostname];
  if (!siteConfig) return;

  const promptInput = document.querySelector(siteConfig.promptSelector);

  if (promptInput && promptInput !== currentPromptInput) {
    //remove listener if it's not pointing to the right one
    if (currentPromptInput) {
      currentPromptInput.removeEventListener("keydown", handlePromptSubmit); //how can I not spell 'listener'
    }

    currentPromptInput = promptInput;
    //listen for keydown on something to attach the listener
    promptInput.addEventListener("keydown", handlePromptSubmit);
    console.log("PromptFootprint: Succesfully attached to ", hostname);
  }
};

document.body.addEventListener("click", (event) => {
  const hostname = window.location.hostname;
  const siteConfig = SITE_CONFIG[hostname];
  if (!siteConfig || !siteConfig.sendButtonSelector) return; 

  const likelySendButton = event.target.closest(siteConfig.sendButtonSelector);

  if (likelySendButton) {
    handlePromptSubmit(event);
  }
}, { capture: true });

const observer = new MutationObserver(() => {
    initListener();
});

observer.observe(document.body, { childList: true, subtree: true});

initListener() //testing
