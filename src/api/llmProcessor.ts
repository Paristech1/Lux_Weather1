/**
 * Gemini LLM Processor
 * 
 * This file provides the integration with Google's Gemini LLM for intelligent
 * weather data processing and insights generation.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

// Define the WeatherData interface if it's not found
interface WeatherData {
  city: string;
  temperature: number;
  description: string;
  weatherInsights?: string;
  tenDayForecast: Array<{
    day: string;
    high: number;
    low: number;
    description?: string;
    insight?: string;
    weather?: string;
    windSpeed: number;
    uvIndex: number;
    hourlyDetails: Array<{
      hour: string;
      temp: number;
      rainChance: number;
      humidity: number;
    }>;
  }>;
  hourlyForecast: Array<{
    hour: string;
    temp: number;
    description?: string;
  }>;
}

// Initialize the Generative AI API with the correct client
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

// Get the generative model
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

/**
 * LLM-powered weather data transformation agent
 * 
 * Enhances the weather data with intelligent processing:
 * - Converts timestamps to local time
 * - Maps weather codes to icon types 
 * - Calculates feelsLike temperatures
 * - Extracts UV risk levels
 * - Adds natural language interpretations
 */
export const weatherDataAgent = async (rawData: any, transformedData: WeatherData): Promise<WeatherData> => {
  // Only process data if we have a valid API key
  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    console.warn('Gemini API key not found, skipping LLM processing');
    return transformedData;
  }

  try {
    // Enhance the data with LLM-powered insights
    const enhancedData = await enhanceWithInsights(transformedData);
    return enhancedData;
  } catch (error) {
    console.error('LLM Processing Error:', error);
    // Fallback to the basic transformed data if LLM processing fails
    return transformedData;
  }
};

/**
 * Generate natural language insights for each day's weather
 */
const enhanceWithInsights = async (weatherData: WeatherData): Promise<WeatherData> => {
  try {
    // Create an enhanced copy of the weather data
    const enhancedData = { ...weatherData };
    
    // Generate weather summary using LLM
    const summary = await generateWeatherSummary(weatherData);
    
    // Add summary to the weather data if available
    if (summary) {
      enhancedData.weatherInsights = summary;
    }
    
    // Process each day to add day-specific insights
    enhancedData.tenDayForecast = await Promise.all(
      weatherData.tenDayForecast.map(async (day: WeatherData['tenDayForecast'][0], index: number) => {
        // Only generate detailed insights for the first 3 days to limit API usage
        if (index < 3) {
          const dayInsight = await generateDayInsight(day);
          return {
            ...day,
            insight: dayInsight || undefined
          };
        }
        return day;
      })
    );
    
    return enhancedData;
  } catch (error) {
    console.error('Error enhancing weather data with insights:', error);
    return weatherData; // Return original data on error
  }
};

/**
 * Generate a weather summary for the overall forecast
 */
const generateWeatherSummary = async (data: WeatherData): Promise<string | null> => {
  try {
    const prompt = `Generate a concise 1-2 sentence summary of the weather for ${data.city}, 
      where the current temperature is ${data.temperature}°F and the current condition is ${data.description}.
      The forecast high is ${data.tenDayForecast[0].high}°F and the low is ${data.tenDayForecast[0].low}°F.
      Focus on significant weather changes, temperature trends, or notable conditions.
      Keep it direct, conversational, and useful for everyday planning.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating weather summary:', error);
    return null;
  }
};

/**
 * Generate insights for a specific day's forecast
 */
const generateDayInsight = async (dayData: WeatherData['tenDayForecast'][0]): Promise<string | null> => {
  try {
    const prompt = `Generate ONE very concise bullet point insight for ${dayData.day} weather:
      • High of ${dayData.high}°F, low of ${dayData.low}°F
      • Weather condition: ${dayData.weather || dayData.description}
      • Wind speed: ${dayData.windSpeed} mph
      • UV Index: ${dayData.uvIndex}
      
      Give a single short sentence (max 15 words) highlighting the most important aspect affecting someone's day.
      Focus on practical implications, not just data.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating day insight:', error);
    return null;
  }
};

/**
 * Generate intelligent error interpretations and solutions
 */
export const interpretApiError = async (error: Error): Promise<string | null> => {
  try {
    const prompt = `Analyze this weather API error and suggest 1-2 simple solutions:
    Error: ${error.message}
    Context: Weather application using Tomorrow.io API
    
    Give a short explanation of what might have caused this error and suggest concrete solutions.
    Keep your answer under 50 words and focus on practical steps.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (e) {
    console.error('Error interpreting API error:', e);
    return null;
  }
};

/**
 * Process natural language queries to get weather parameters
 */
export const processWeatherQuery = async (query: string): Promise<any | null> => {
  try {
    const prompt = `Convert this natural language query about weather into structured parameters:
    "${query}"
    
    Available parameters:
    - location: City name or coordinates
    - fields: temperature, precipitation, windSpeed, etc.
    - timesteps: 1h, 1d
    - units: imperial/metric
    
    Return ONLY valid JSON with these parameters. Do not include explanations.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonResponse = response.text();
    
    try {
      return jsonResponse ? JSON.parse(jsonResponse) : null;
    } catch (parseError) {
      console.error('Error parsing LLM JSON response:', parseError);
      return null;
    }
  } catch (error) {
    console.error('Error processing weather query:', error);
    return null;
  }
}; 