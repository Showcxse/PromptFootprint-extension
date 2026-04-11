//Get prompt editable div / textarea content
import { SITE_CONFIG } from "../utils/config";

let currentPromptInput = null;

const handlePromptSubmit = (event) => {
  //dont do shit if input is anything except send
  if (event.type === "keydown" && (event.key !== "Enter" || event.shiftKey)) {
    return;
  }

  const hostname = window.location.hostname;
  const siteConfig = SITE_CONFIG[hostname];

  if (!siteConfig) return;

  const promptText = siteConfig.getPrompt(currentPromptInput);

  if (promptText && promptText.trim().length > 0) {
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
      currentPromptInput.removeEventLisenter("keydown", handlePromptSubmit);
    }

    currentPromptInput = promptInput;
    //listen for keydown on something to attach the listener
    promptInput.addEventListener("keydown", handlePromptSubmit);
    console.log("PromptFootprint: Succesfully attached to ", hostname);
  }
};

const observer = new MutationObserver(() => {
    initListener();
});

observer.observe(document.body, { childList: true, subtree: true});

initListener() //testing
