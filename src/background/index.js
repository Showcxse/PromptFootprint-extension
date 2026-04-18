import { encodingForModel } from "js-tiktoken";
import { MODEL_CONFIG } from "../utils/config";
import { updateGlobalFootprint } from "../utils/firebase";
//I FEEL LIKE MY CODE IS SLOPPY. I'M GOING TO NUKE THE WHOLE THING AND COMBINE BOTH FUNCTIONS. SORRY FUTURE ME IF THIS MAKES EVEN MORE STUFF TO FIX

async function processCarbonCalculation(text, model, isOutput) {
  const enc = encodingForModel("gpt-4o");
  const tokens = enc.encode(text).length;
  const activeModel = MODEL_CONFIG[model];

  let currentGridIntensity;

  if (activeModel.fallbackIntensity) {
    currentGridIntensity = activeModel.fallbackIntensity;
  } else {
    const response = await fetch(
      `https://promptfootprint.vercel.app/api/get-grid-intensity?zone=${activeModel.likelyZone}`
    );

    if (!response.ok)
      throw new Error("Error establishing link to PromptFootprint API Bridge");

    const gridData = await response.json();
    currentGridIntensity = gridData.carbonIntensity;
  }
  //According to google, output tokens use significantly more power than input tokens. 2 is an arbitrary estimation on the lower end
  const energyMultiplier = isOutput ? 2 : 1;
  const totalKwh = tokens * (activeModel.energyPerToken * energyMultiplier);
  const newEmissions = totalKwh * currentGridIntensity;

  const storedData = await chrome.storage.local.get([
    "totalEmissions",
    "latestEmissions",
    "latestInputEmissions", //adding these last two so there is more transparency on what causes what
    "latestOutputEmissions",
  ]);
  const userTotal = storedData.totalEmissions || 0;
  const currentLatestEmissions = storedData.latestEmissions || 0;

  let newLatestEmissions, newLatestInput, newLatestOutput;

  if (isOutput) {
    newLatestEmissions = currentLatestEmissions + newEmissions;
    newLatestInput = storedData.latestInputEmissions || 0;
    newLatestOutput = newEmissions;
  } else {
    newLatestEmissions = newEmissions;
    newLatestInput = newEmissions;
    newLatestOutput = 0;
  }

  /*
  const latesterEmissions = isOutput
    ? currentLatestEmissions + newEmissions
    : newEmissions;
  */
  await chrome.storage.local.set({
    totalEmissions: userTotal + newEmissions,
    latestEmissions: newLatestEmissions,
    latestInputEmissions: newLatestInput,
    latestOutputEmissions: newLatestOutput,
  });

  updateGlobalFootprint(newEmissions, tokens);

  return newEmissions;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (
    request.type === "CALCULATE_FOOTPRINT" ||
    request.type === "CALCULATE_OUTPUT_FOOTPRINT"
  ) {
    const isOutput = request.type === "CALCULATE_OUTPUT_FOOTPRINT";
    const textToTokenize = isOutput ? request.responseText : request.promptText;

    console.log(
      `PromptFootprint: Processing ${isOutput ? "Output" : "Input"} for: `,
      request.model,
    );

    processCarbonCalculation(textToTokenize, request.model, isOutput).then(
      (emissions) => {
        console.log(`PromptFootprint: Successfully added ${emissions}g CO2`);
        sendResponse({ success: true, emissionsAdded: emissions});
      }
    ).catch((error) => {
      console.error(`PromptFootprint: Error calculating emissions: `, error);
      sendResponse({ success: false, error: error.message});
    });

    return true; //this little line holds the whole thing together
  }
});
