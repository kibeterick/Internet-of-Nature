import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function askNatureAI(prompt: string, context?: string) {
  const model = "gemini-3-flash-preview";
  const systemInstruction = `You are the "Internet of Nature" AI assistant. 
  Your goal is to help urban ecologists, city planners, and citizens understand and care for urban nature.
  You have access to real-time sensor data (simulated) and ecological knowledge.
  Be professional, insightful, and warm. Use ecological terms but explain them if they are complex.
  Current Context: ${context || 'General urban nature monitoring'}`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm sorry, I'm having trouble connecting to the nature network right now. Please try again later.";
  }
}

export async function* askNatureAIStream(prompt: string, context?: string) {
  const model = "gemini-3-flash-preview";
  const systemInstruction = `You are the "Internet of Nature" AI assistant. 
  Your goal is to help urban ecologists, city planners, and citizens understand and care for urban nature.
  You have access to real-time sensor data (simulated) and ecological knowledge.
  Be professional, insightful, and warm. Use ecological terms but explain them if they are complex.
  Current Context: ${context || 'General urban nature monitoring'}`;

  try {
    const response = await ai.models.generateContentStream({
      model,
      contents: prompt,
      config: {
        systemInstruction,
      },
    });

    for await (const chunk of response) {
      yield chunk.text;
    }
  } catch (error) {
    console.error("Gemini Streaming Error:", error);
    yield "I'm sorry, I'm having trouble connecting to the nature network right now.";
  }
}
export async function identifySpecies(imageData: string, mimeType: string) {
  const model = "gemini-3-flash-preview";
  const systemInstruction = `You are an expert urban ecologist and taxonomist. 
  Analyze the provided image and identify the species (plant, insect, bird, or animal).
  Provide:
  1. Common Name
  2. Scientific Name
  3. Ecological Role in an urban environment
  4. Care or conservation advice.
  Keep the tone professional and helpful.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          inlineData: {
            data: imageData.split(',')[1], // Remove the data:image/...;base64, prefix
            mimeType,
          },
        },
        { text: "Identify this species and provide ecological context." },
      ],
      config: {
        systemInstruction,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Species ID Error:", error);
    return "I couldn't identify the species in this image. Please ensure the photo is clear and try again.";
  }
}

export async function generateEcologicalReport(sensorData: any) {
  const model = "gemini-3-flash-preview";
  const systemInstruction = `You are a Senior Urban Ecologist. 
  Generate a comprehensive "State of the Urban Forest" report based on the provided sensor data.
  The report should include:
  1. Executive Summary
  2. Detailed Analysis of Soil, Air, and Biodiversity
  3. Risk Assessment (e.g., heat stress, drought)
  4. Actionable Recommendations for the next 7 days.
  Use a professional, data-driven tone. Format with clear headings.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Sensor Data: ${JSON.stringify(sensorData)}`,
      config: { systemInstruction },
    });
    return response.text;
  } catch (error) {
    console.error("Report Generation Error:", error);
    return "Failed to generate the ecological report. Please check sensor connectivity.";
  }
}

export async function simulateEcosystemResponse(scenario: string, currentData: any) {
  const model = "gemini-3-flash-preview";
  const systemInstruction = `You are an Ecosystem Simulator AI. 
  Predict how the urban ecosystem will respond to a specific hypothetical scenario.
  Scenario: ${scenario}
  Current State: ${JSON.stringify(currentData)}
  
  Provide:
  1. Immediate Impact (0-24h)
  2. Secondary Effects (1-7 days)
  3. Long-term Resilience implications
  4. Mitigation strategies if the impact is negative.
  Be scientifically grounded but accessible.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Simulate the impact of: ${scenario}`,
      config: { systemInstruction },
    });
    return response.text;
  } catch (error) {
    console.error("Simulation Error:", error);
    return "Simulation failed. The ecosystem model is currently recalibrating.";
  }
}
