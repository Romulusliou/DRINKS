import { GoogleGenAI, Type } from "@google/genai";
import { DrinkRecord, AIAnalysisResult } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeDrinks = async (records: DrinkRecord[]): Promise<AIAnalysisResult> => {
  if (records.length === 0) {
    throw new Error("No records to analyze");
  }

  // Optimize payload size by mapping essential fields, now including review and toppings
  const dataSummary = records.map(r => ({
    who: r.drinkerName,
    item: `${r.brand} - ${r.drinkName}`,
    toppings: r.toppings || "None",
    sugar: r.sugarLevel,
    price: r.price,
    date: r.date,
    rating: r.rating,
    review: r.review || ""
  }));

  const prompt = `
    Analyze this bubble tea consumption log for 2026 from a group of friends living in Taipei.
    
    Data: ${JSON.stringify(dataSummary)}

    Please provide a fun, slightly witty, but insightful analysis.
    1. A general summary of the group's habits (mention favorite brands or toppings).
    2. A health tip based on the sugar/ice/toppings trends.
    3. "Awards" for the drinkers (e.g., "Chewing Machine" for toppings, "Sugar King", "SOMA Addict").
    4. A prediction for the next trend they should try based on their reviews.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          healthTip: { type: Type.STRING },
          awards: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                recipient: { type: Type.STRING },
                description: { type: Type.STRING }
              }
            }
          },
          predictedTrend: { type: Type.STRING }
        }
      }
    }
  });

  if (response.text) {
    return JSON.parse(response.text) as AIAnalysisResult;
  }
  
  throw new Error("Failed to generate analysis");
};