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
      `https://api.electricitymap.org/v3/carbon-intensity/latest?zone=${activeModel.likelyZone}`,
      {
        headers: {
          "auth-token": import.meta.env.VITE_ELECTRICITY_MAPS_API_KEY,
        },
      },
    );

    if (!response.ok)
      throw new Error("Error establishing link to Electricity Maps API");

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
  ]);
  const userTotal = storedData.totalEmissions || 0;

  const currentLatestEmissions = storedData.latestEmissions || 0;
  const latesterEmissions = isOutput
    ? currentLatestEmissions + newEmissions
    : newEmissions;

  await chrome.storage.local.set({
    totalEmissions: userTotal + newEmissions,
    latestEmissions: latesterEmissions,
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
