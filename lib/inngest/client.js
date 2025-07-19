import { Inngest } from "inngest";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "assetaxis", name: "AssetAxis",
    retryFunction: async (attempt)=>({
        // Customize the retry behavior here
        delay: Math.pow(2,attempt) * 1000, // Exponential backoff
        maxAttempts: 2,
    }),
 });