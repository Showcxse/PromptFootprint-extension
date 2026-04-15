import { initializeApp } from "firebase/app";
import { getFirestore, doc, updateDoc, increment } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export const updateGlobalFootprint = async (emissionsToAdd, tokensToAdd) => {
    try {
        const globalRef = doc(db, "stats", "global");
        const equivalentMilesToAdd = (emissionsToAdd / 400).toFixed(6);
        await updateDoc(globalRef, {
            totalEmissions: increment(emissionsToAdd),
            totalCalculations: increment(1),
            totalTokens: increment(tokensToAdd),
            totalMilesDriven: increment(equivalentMilesToAdd)


        });
        console.log(`PromptFootprint: Added ${emissionsToAdd} to cumulative total!`)
    } catch (error) {
        console.log(`PromptFootprint: Error adding latest emissions to cumulative global total: `, error)
    }
}