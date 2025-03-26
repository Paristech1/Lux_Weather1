/**
 * Tomorrow.io Weather API Configuration
 * 
 * This file provides the configuration and functions needed to connect
 * the weather application to the Tomorrow.io weather API service.
 */

import { WeatherData } from '../types';

// API usage tracking
export const API_USAGE = {
  // Total calls allowed per hour
  HOURLY_LIMIT: 25,
  // Current call count in this hour
  callCount: 0,
  // Timestamp of the last reset
  lastReset: Date.now(),
  // Whether we need to show API limit warning to user
  showLimitWarning: false
};

// Cache for weather data to reduce API calls
export const WEATHER_CACHE = new Map<string, {
  data: WeatherData,
  timestamp: number
}>();

// Cache duration in milliseconds (30 minutes)
export const CACHE_DURATION = 30 * 60 * 1000;

// API configuration
export const API_CONFIG = {
  // API key loaded from environment variable
  API_KEY: import.meta.env.VITE_TOMORROW_API_KEY || '',
  // Base URL for the API
  BASE_URL: import.meta.env.VITE_TOMORROW_BASE_URL || 'https://api.tomorrow.io/v4',
  // Units for temperature (imperial for Fahrenheit)
  UNITS: 'imperial',
  // Language for descriptions
  LANG: 'en'
};

// Interfaces for Tomorrow.io API parameters
export interface TimelineParams {
  location: string;
  fields: string[];
  timesteps: string[];
  units: string;
}

/**
 * Resets the API call counter if an hour has passed since the last reset
 */
export const checkAndResetApiCounter = (): void => {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  
  if (now - API_USAGE.lastReset >= oneHour) {
    console.log('Resetting API call counter (new hour)');
    API_USAGE.callCount = 0;
    API_USAGE.lastReset = now;
    API_USAGE.showLimitWarning = false;
  }
};

/**
 * Gets remaining API calls for this hour
 */
export const getRemainingApiCalls = (): number => {
  checkAndResetApiCounter();
  return API_USAGE.HOURLY_LIMIT - API_USAGE.callCount;
};

/**
 * Checks if we're approaching the API limit
 */
export const isNearApiLimit = (): boolean => {
  checkAndResetApiCounter();
  return getRemainingApiCalls() <= 5; // Warning when 5 or fewer calls remain
};

/**
 * Checks if we've reached the API limit
 */
export const hasReachedApiLimit = (): boolean => {
  checkAndResetApiCounter();
  return getRemainingApiCalls() <= 0;
};

/**
 * Fetches weather timeline data from Tomorrow.io API
 * 
 * This endpoint provides current weather, hourly and daily forecasts in one call.
 */
export const fetchWeatherTimeline = async (params: TimelineParams) => {
  // Check if we need to reset the counter
  checkAndResetApiCounter();
  
  // Check if we've reached the API limit
  if (hasReachedApiLimit()) {
    API_USAGE.showLimitWarning = true;
    throw new Error('API limit reached. Try again in ' + 
      Math.ceil((API_USAGE.lastReset + 60 * 60 * 1000 - Date.now()) / 60000) + 
      ' minutes or use cached data.');
  }
  
  try {
    // Use direct API if we're not in browser or use proxy URL 
    const baseUrl = typeof window !== 'undefined' 
      ? '/api/tomorrow/timelines' 
      : `${API_CONFIG.BASE_URL}/timelines`;
      
    console.log('Fetching weather data from:', baseUrl);
    
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': API_CONFIG.API_KEY
      },
      body: JSON.stringify({
        location: params.location,
        fields: params.fields,
        timesteps: params.timesteps,
        units: params.units,
        startTime: 'now',
        endTime: 'nowPlus5d'
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(`API Error: ${response.status} - ${errorData?.message || response.statusText}`);
    }
    
    // Increment the call counter on successful API call
    API_USAGE.callCount++;
    console.log(`API Call #${API_USAGE.callCount} of ${API_USAGE.HOURLY_LIMIT} this hour`);
    
    return await response.json();
  } catch (error) {
    console.error('Tomorrow.io API Error:', error);
    throw error;
  }
};

/**
 * Map Tomorrow.io weather codes to our application's icon types
 */
export const mapWeatherCodeToIcon = (weatherCode: number): 'sunny' | 'cloudy' | 'rainy' | 'partly-cloudy' | 'thunderstorm' | 'snow' | 'foggy' | 'windy' => {
  // Tomorrow.io weather codes: https://docs.tomorrow.io/reference/data-core-weather-codes
  
  // Clear
  if (weatherCode === 1000) return 'sunny';
  
  // Partly Cloudy
  if ([1100, 1101, 1102].includes(weatherCode)) return 'partly-cloudy';
  
  // Cloudy
  if ([1001, 1103].includes(weatherCode)) return 'cloudy';
  
  // Rain (includes drizzle, rain, freezing rain)
  if ([4000, 4001, 4200, 4201, 4203, 4204, 4205, 4213, 4214, 4215].includes(weatherCode)) return 'rainy';
  
  // Snow (all forms of snow and mixed precipitation)
  if ([5000, 5001, 5100, 5101, 5103, 5104, 5105, 5106, 5107, 5115, 5116, 5117].includes(weatherCode)) return 'snow';
  
  // Thunderstorm
  if ([8000, 8001, 8003].includes(weatherCode)) return 'thunderstorm';
  
  // Foggy (fog, mist)
  if ([2000, 2100].includes(weatherCode)) return 'foggy';
  
  // Windy (high winds)
  if ([6000, 6001, 6002, 6003, 6004, 7102].includes(weatherCode)) return 'windy';
  
  // Default fallback - check for additional conditions
  
  // If the code is in the precipitation range but not covered above, default to rainy
  if (weatherCode >= 4000 && weatherCode < 5000) return 'rainy';
  
  // If the code is in the snow/ice range but not covered above, default to snow
  if (weatherCode >= 5000 && weatherCode < 6000) return 'snow';
  
  // If the code is in the wind range but not covered above, default to windy
  if (weatherCode >= 6000 && weatherCode < 7000) return 'windy';
  
  // For any other code, default to partly-cloudy as a safe middle ground
  return 'partly-cloudy';
};

/**
 * Format hour string (e.g., "10 AM")
 */
export const formatHour = (isoTime: string): string => {
  const date = new Date(isoTime);
  let hours = date.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // Handle midnight (0 hours)
  return `${hours} ${ampm}`;
};

/**
 * Format day string (e.g., "Monday")
 */
export const formatDay = (isoTime: string): string => {
  const date = new Date(isoTime);
  return date.toLocaleDateString('en-US', { weekday: 'long' });
};

/**
 * Helper function to calculate UV risk level description
 */
export const getUVRiskLevel = (uvIndex: number): string => {
  if (uvIndex < 3) return 'Low';
  if (uvIndex < 6) return 'Moderate';
  if (uvIndex < 8) return 'High';
  if (uvIndex < 11) return 'Very High';
  return 'Extreme';
};

/**
 * Main transformation function to convert Tomorrow.io data to our app format
 * Note: This function will later be enhanced with the LLM processor
 */
export const transformTomorrowData = (data: any, cityName: string): WeatherData => {
  // Access the timeline data
  const timelines = data.data.timelines;
  
  // Current conditions from the minutely data (first item)
  const currentData = timelines.find((t: any) => t.timestep === '1h')?.intervals[0];
  
  // Hourly forecast (next 5 hours)
  const hourlyData = timelines.find((t: any) => t.timestep === '1h')?.intervals.slice(0, 5);
  
  // Daily forecast (5 days)
  const dailyData = timelines.find((t: any) => t.timestep === '1d')?.intervals.slice(0, 5);
  
  // Extract the city name from location data (or provide a default/placeholder)
  const city = cityName || 'Unknown Location';
  
  // Current weather description based on weather code
  const weatherCode = currentData.values.weatherCode;
  const weatherDesc = mapWeatherCodeToIcon(weatherCode);
  
  // Build the hourly forecast array
  const hourlyForecast = hourlyData.map((hour: any) => ({
    hour: formatHour(hour.startTime),
    temp: Math.round(hour.values.temperature),
    description: mapWeatherCodeToIcon(hour.values.weatherCode)
  }));
  
  // Build the forecast array (5 days)
  const tenDayForecast = dailyData.map((day: any) => {
    // Get day details
    const values = day.values;
    
    // Calculate air quality index (if available)
    const airQuality = {
      index: values.epaIndex || values.particlePollutionIndex || 35,  // Default to moderate if not available
      description: values.epaHealthConcern || 'Moderate'
    };
    
    // Create simulated hourly details for the day (6 intervals)
    const hourlyDetails = Array(6).fill(null).map((_, i) => {
      const hour = 6 + (i * 3);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 === 0 ? 12 : hour % 12;
      
      return {
        hour: `${displayHour} ${ampm}`,
        temp: Math.round(values.temperatureAvg + (Math.random() * 10 - 5)), // Randomize around day avg
        rainChance: Math.round(values.precipitationProbabilityAvg || 0),
        humidity: Math.round(values.humidityAvg || 50)
      };
    });
    
    return {
      day: formatDay(day.startTime),
      high: Math.round(values.temperatureMax),
      low: Math.round(values.temperatureMin),
      description: mapWeatherCodeToIcon(values.weatherCodeMax || 1000),
      airQuality,
      hourlyDetails,
      feelsLike: Math.round(values.temperatureApparent || values.temperatureAvg),
      windSpeed: Math.round(values.windSpeedAvg || 0),
      uvIndex: Math.round(values.uvIndexAvg || 0)
    };
  });
  
  // Return the complete weather data object
  return {
    city,
    temperature: Math.round(currentData.values.temperature),
    description: weatherDesc,
    hourlyForecast,
    tenDayForecast // Note: This will now contain 5 days of data
  };
};

/**
 * Main Function to Fetch Weather Data for coordinates
 */
export const fetchWeatherForCoords = async (lat: number, lon: number, cityName: string): Promise<WeatherData> => {
  // Create a cache key based on coordinates
  const cacheKey = `${lat},${lon}`;
  
  // Check if we have cached data
  const cachedData = WEATHER_CACHE.get(cacheKey);
  const now = Date.now();
  
  // If we have valid cached data, use it
  if (cachedData && (now - cachedData.timestamp < CACHE_DURATION)) {
    console.log(`Using cached weather data for ${cityName} (${Math.round((now - cachedData.timestamp) / 60000)} minutes old)`);
    return cachedData.data;
  }
  
  try {
    const params: TimelineParams = {
      location: `${lat},${lon}`,
      fields: [
        'temperature', 'temperatureApparent', 'temperatureMin', 'temperatureMax',
        'windSpeed', 'windDirection', 'humidity', 'precipitationProbability',
        'precipitationIntensity', 'weatherCode', 'uvIndex', 'visibility',
        'cloudCover', 'pressureSurfaceLevel'
      ],
      timesteps: ['1h', '1d'],
      units: API_CONFIG.UNITS
    };
    
    const data = await fetchWeatherTimeline(params);
    const weatherData = transformTomorrowData(data, cityName);
    
    // Store in cache
    WEATHER_CACHE.set(cacheKey, {
      data: weatherData,
      timestamp: now
    });
    
    return weatherData;
  } catch (error) {
    console.error(`Error fetching weather data for coordinates ${lat},${lon}:`, error);
    throw error;
  }
};

/**
 * Function to Fetch Weather Data for a city name
 * Note: Tomorrow.io API uses coordinates primarily, so we need to convert city names to coords
 */
export const fetchWeatherForCity = async (cityName: string): Promise<WeatherData> => {
  // Create a cache key
  const cacheKey = cityName.toLowerCase();
  
  // Check if we have cached data
  const cachedData = WEATHER_CACHE.get(cacheKey);
  const now = Date.now();
  
  // If we have valid cached data, use it
  if (cachedData && (now - cachedData.timestamp < CACHE_DURATION)) {
    console.log(`Using cached weather data for ${cityName} (${Math.round((now - cachedData.timestamp) / 60000)} minutes old)`);
    return cachedData.data;
  }
  
  try {
    // For simplicity, using hardcoded coordinates for common cities
    // In a real app, you'd use a geocoding service to convert city names to coordinates
    const cityCoords: {[key: string]: {lat: number, lon: number}} = {
      'new york': {lat: 40.7128, lon: -74.0060},
      'paris': {lat: 48.8566, lon: 2.3522},
      'miami': {lat: 25.7617, lon: -80.1918},
      'denver': {lat: 39.7392, lon: -104.9903},
      'chicago': {lat: 41.8781, lon: -87.6298},
      'san francisco': {lat: 37.7749, lon: -122.4194},
      'seattle': {lat: 47.6062, lon: -122.3321},
      'london': {lat: 51.5074, lon: -0.1278},
      'tokyo': {lat: 35.6762, lon: 139.6503},
      'sydney': {lat: -33.8688, lon: 151.2093},
      'las vegas': {lat: 36.1699, lon: -115.1398},
      'philadelphia': {lat: 39.9526, lon: -75.1652},
      'easton': {lat: 40.6918, lon: -75.2207}, // Easton, PA coordinates
      'boston': {lat: 42.3601, lon: -71.0589},
      'los angeles': {lat: 34.0522, lon: -118.2437},
      'austin': {lat: 30.2672, lon: -97.7431},
      'portland': {lat: 45.5152, lon: -122.6784},
      'atlanta': {lat: 33.7490, lon: -84.3880},
      'houston': {lat: 29.7604, lon: -95.3698},
      'dallas': {lat: 32.7767, lon: -96.7970}
    };
    
    // Find city coordinates or use a default
    const lowerCityName = cityName.toLowerCase();
    
    let coords;
    if (cityCoords[lowerCityName]) {
      coords = cityCoords[lowerCityName];
    } else {
      // Use New York coordinates but preserve the original city name
      console.log(`City "${cityName}" not found in coordinates database, using approximate location`);
      coords = {lat: 40.7128, lon: -74.0060}; // Default to NYC coordinates
    }
    
    const weatherData = await fetchWeatherForCoords(coords.lat, coords.lon, cityName);
    
    // Make sure the city name is preserved
    if (weatherData.city !== cityName) {
      weatherData.city = cityName;
    }
    
    // Store in cache with city name as key
    WEATHER_CACHE.set(cacheKey, {
      data: weatherData,
      timestamp: now
    });
    
    return weatherData;
  } catch (error) {
    console.error(`Error fetching weather data for city ${cityName}:`, error);
    throw error;
  }
}; 