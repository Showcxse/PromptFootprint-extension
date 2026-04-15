import { encodingForModel } from "js-tiktoken";
import { MODEL_CONFIG } from "../utils/config";
import { updateGlobalFootprint } from "../utils/firebase";


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "CALCULATE_FOOTPRINT") {
    console.log("Received Prompt For: ", request.model);

    (async () => {
      try {
        const enc = encodingForModel("gpt-4o");
        const tokens = enc.encode(request.promptText).length;
        const activeModel = MODEL_CONFIG[request.model];

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
            throw new Error("Could not connect to the Electricity Maps API");

          const data = await response.json();
          currentGridIntensity = data.carbonIntensity;
        }

        const totalKwh = tokens * activeModel.energyPerToken;
        const newEmissions = totalKwh * currentGridIntensity;

        const storedData = await chrome.storage.local.get(["totalEmissions"]);
        const userTotal = storedData.totalEmissions || 0;
        await chrome.storage.local.set({
          totalEmissions: userTotal + newEmissions,
          latestEmissions: newEmissions
        });

        console.log(
          `PromptFootprint: Added ${newEmissions}g CO2. New Total: ${userTotal}`,
        );
        updateGlobalFootprint(newEmissions, tokens);

        sendResponse({ success: true, emissionsAdded: newEmissions });
      } catch (error) {
        console.error("PromptFootprint: Error calculating emissions: ", error);
        sendResponse({ success: false, error: error.message });
      }
    })();

    return true;


  }
});
