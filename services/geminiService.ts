import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getStudyMotivation = async (minutesFocused: number, petName: string): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    const prompt = `
      I just finished a ${minutesFocused} minute focus session using the Pomodoro technique.
      My virtual pet is named "${petName}".
      Give me a very short (max 2 sentences), cute, and motivating message from the perspective of my pet "${petName}".
      The pet is happy that I worked hard.
      Do not use quotes around the response.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "Great job! Keep it up!";
  } catch (error) {
    console.error("Error fetching motivation:", error);
    return `Meow! (Translation: Great job focusing for ${minutesFocused} minutes!)`;
  }
};

export const getBreakActivity = async (): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash';
    const prompt = `Suggest one simple, quick (5 minute) physical stretch or relaxation activity to do during a break from computer work. Keep it under 15 words.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "Stretch your arms and look out a window.";
  } catch (error) {
    return "Stand up and stretch your legs!";
  }
};
