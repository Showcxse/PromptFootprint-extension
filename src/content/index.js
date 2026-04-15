//Get prompt editable div / textarea content
import { SITE_CONFIG } from "../utils/config";

const hostname = window.location.hostname;
const siteConfig = SITE_CONFIG[hostname];


let currentPromptInput = null;
let responseTimer = null;
let lastSnipedText = "";

if (!siteConfig) {
  console.log("PromptFootprint: Site not supported, going to sleep.");
}


const handlePromptSubmit = (event) => {
  if (event.type === "keydown" && (event.key !== "Enter" || event.shiftKey)) {
    return;
  }

  const promptText = siteConfig.getPrompt(currentPromptInput);

  if (promptText && promptText.trim().length > 0) {
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

const initInputObserver = () => {
  const promptInput = document.querySelector(siteConfig.promptSelector);

  if (promptInput && promptInput !== currentPromptInput) {
    //remove listener if it's not pointing to the right one
    if (currentPromptInput) {
      currentPromptInput.removeEventListener("keydown", handlePromptSubmit); 
    }

    currentPromptInput = promptInput;
    //listen for keydown on something to attach the listener
    promptInput.addEventListener("keydown", handlePromptSubmit);
    console.log("PromptFootprint: Succesfully attached to ", hostname);
  }
};

const snipeOutput = () => {
  const responses = document.querySelectorAll(siteConfig.responseSelector); //grab all of them in case there is multiple on screen 
  if (responses.length === 0) return;

  const latestResponse = responses[responses.length -1];
  const responseText = latestResponse.innerText;


  if (responseText === lastSnipedText || responseText.trim().length === 0) return;
  lastSnipedText = responseText;

  console.log("PromptFootprint: Thinks AI is done talking. Output length: ", responseText.length);


  chrome.runtime.sendMessage({
    type: "CALCULATE_OUTPUT_FOOTPRINT",
    responseText,
    model: siteConfig.model,
  });
};

document.body.addEventListener("click", (event) => { //so it also works when you click the button
  if (!siteConfig.sendButtonSelector) return; 

  const likelySendButton = event.target.closest(siteConfig.sendButtonSelector);

  if (likelySendButton) {
    handlePromptSubmit(event);
  }
}, { capture: true });

const observer = new MutationObserver(() => {
    initInputObserver();


    if (siteConfig.responseSelector) { //debouncer
      clearTimeout(responseTimer);

      responseTimer = setTimeout(() => {
        snipeOutput();
      }, 3000); 
    }
});
if (siteConfig) {
  observer.observe(document.body, { childList: true, subtree: true, characterData: true});
  initInputObserver();
}


