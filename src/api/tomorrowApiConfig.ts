/**
 * Tomorrow.io Weather API Configuration
 * 
 * This file provides the configuration and functions needed to connect
 * the weather application to the Tomorrow.io weather API service.
 */

import { WeatherData } from '../types';

// Enhanced API usage tracking with more detailed metrics
export const API_USAGE = {
  // Total calls allowed per day with Tomorrow.io base plan
  DAILY_LIMIT: 1000,
  // Self-imposed hourly limit to avoid hitting daily limits too quickly
  HOURLY_LIMIT: 25,
  // Current call count in this hour
  callCount: 0,
  // Daily call count tracking
  dailyCallCount: 0,
  // Timestamp of the last hourly reset
  lastHourlyReset: Date.now(),
  // Timestamp of the last daily reset
  lastDailyReset: Date.now(),
  // Whether we need to show API limit warning to user
  showLimitWarning: false,
  // Track API calls by endpoint type
  callsByType: {
    current: 0,
    forecast: 0,
    airQuality: 0
  },
  // Track API calls by city (for analytics)
  callsByCity: {} as Record<string, number>
};

// Enhanced cache with TTL and prioritization
export const WEATHER_CACHE = new Map<string, {
  data: WeatherData,
  timestamp: number,
  accessCount: number,  // Track how often this city is accessed
  lastAccessed: number  // Track when this city was last accessed
}>();

// Cache durations in milliseconds
export const CACHE_CONFIG = {
  // Regular cache duration (30 minutes)
  STANDARD_DURATION: 30 * 60 * 1000,
  // Extended cache duration for less-changing data (1 hour)
  EXTENDED_DURATION: 60 * 60 * 1000,
  // Maximum cache size (number of cities)
  MAX_CACHE_SIZE: 10,
  // Refresh threshold - when cache is this old, try to refresh it in background
  REFRESH_THRESHOLD: 20 * 60 * 1000
};

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
  const oneDay = 24 * 60 * 60 * 1000;
  
  // Reset hourly counter if needed
  if (now - API_USAGE.lastHourlyReset >= oneHour) {
    console.log('Resetting hourly API call counter');
    API_USAGE.callCount = 0;
    API_USAGE.lastHourlyReset = now;
    API_USAGE.showLimitWarning = false;
  }
  
  // Reset daily counter if needed
  if (now - API_USAGE.lastDailyReset >= oneDay) {
    console.log('Resetting daily API call counter');
    API_USAGE.dailyCallCount = 0;
    API_USAGE.lastDailyReset = now;
    
    // Also reset call type tracking
    API_USAGE.callsByType = {
      current: 0,
      forecast: 0,
      airQuality: 0
    };
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
 * Gets remaining API calls for today
 */
export const getRemainingDailyApiCalls = (): number => {
  checkAndResetApiCounter();
  return API_USAGE.DAILY_LIMIT - API_USAGE.dailyCallCount;
};

/**
 * Checks if we're approaching the API limit
 */
export const isNearApiLimit = (): boolean => {
  checkAndResetApiCounter();
  return getRemainingApiCalls() <= 5 || getRemainingDailyApiCalls() <= 50;
};

/**
 * Checks if we've reached the API limit
 */
export const hasReachedApiLimit = (): boolean => {
  checkAndResetApiCounter();
  return getRemainingApiCalls() <= 0 || getRemainingDailyApiCalls() <= 0;
};

/**
 * Manages the cache size by removing least recently used entries
 * when the cache exceeds MAX_CACHE_SIZE
 */
export const manageCacheSize = (): void => {
  if (WEATHER_CACHE.size <= CACHE_CONFIG.MAX_CACHE_SIZE) return;
  
  // Convert cache entries to array for sorting
  const entries = Array.from(WEATHER_CACHE.entries());
  
  // Sort by last accessed (oldest first)
  entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
  
  // Remove oldest entries until we're under the limit
  while (entries.length > CACHE_CONFIG.MAX_CACHE_SIZE) {
    const [key] = entries.shift() || [''];
    if (key) {
      WEATHER_CACHE.delete(key);
      console.log(`Cache pruning: removed ${key} from cache`);
    }
  }
};

/**
 * Gets cached weather data if available and not expired
 * @param cityName City name to lookup
 * @param maxAge Maximum age of cache in ms (defaults to standard duration)
 * @returns WeatherData or null if not found or expired
 */
export const getCachedWeatherData = (
  cityName: string, 
  maxAge: number = CACHE_CONFIG.STANDARD_DURATION
): WeatherData | null => {
  const cacheKey = cityName.toLowerCase();
  const cacheEntry = WEATHER_CACHE.get(cacheKey);
  
  if (!cacheEntry) return null;
  
  const now = Date.now();
  
  // Update access stats even if we return null
  cacheEntry.accessCount += 1;
  cacheEntry.lastAccessed = now;
  WEATHER_CACHE.set(cacheKey, cacheEntry);
  
  // Check if cache is expired
  if (now - cacheEntry.timestamp > maxAge) {
    return null;
  }
  
  return cacheEntry.data;
};

/**
 * Fetches weather timeline data from Tomorrow.io API
 * 
 * This endpoint provides current weather, hourly and daily forecasts in one call.
 */
export const fetchWeatherTimeline = async (params: TimelineParams) => {
  // Check if we need to reset the counter
  checkAndResetApiCounter();
  
  // Extract city name from location for logging
  const cityName = typeof params.location === 'string' 
    ? params.location 
    : 'unknown location';
  
  // Check if we've reached the API limit
  if (hasReachedApiLimit()) {
    API_USAGE.showLimitWarning = true;
    throw new Error('API limit reached. Try again in ' + 
      Math.ceil((API_USAGE.lastHourlyReset + 60 * 60 * 1000 - Date.now()) / 60000) + 
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
    
    // Increment all counters on successful API call
    API_USAGE.callCount++;
    API_USAGE.dailyCallCount++;
    
    // Track call by type based on timesteps
    if (params.timesteps.includes('1h')) {
      API_USAGE.callsByType.forecast++;
    } else {
      API_USAGE.callsByType.current++;
    }
    
    // Track calls by city
    API_USAGE.callsByCity[cityName] = (API_USAGE.callsByCity[cityName] || 0) + 1;
    
    console.log(`API Call #${API_USAGE.callCount} of ${API_USAGE.HOURLY_LIMIT} this hour (${API_USAGE.dailyCallCount} today)`);
    
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
 * Fetches weather for coordinates, with enhanced caching and error handling
 */
export const fetchWeatherForCoords = async (lat: number, lon: number, cityName: string): Promise<WeatherData> => {
  // Normalize city name for caching
  const cacheKey = cityName.toLowerCase();
  
  // Try to get from cache first
  const cachedData = getCachedWeatherData(cacheKey);
  if (cachedData) {
    console.log(`Using cached data for ${cityName} (cached ${Math.floor((Date.now() - WEATHER_CACHE.get(cacheKey)?.timestamp!) / 60000)} minutes ago)`);
    
    // If cache is approaching refresh threshold, trigger background refresh
    const cacheAge = Date.now() - (WEATHER_CACHE.get(cacheKey)?.timestamp || 0);
    if (cacheAge > CACHE_CONFIG.REFRESH_THRESHOLD) {
      console.log(`Cache for ${cityName} is getting stale, refreshing in background`);
      setTimeout(() => {
        refreshWeatherDataInBackground(lat, lon, cityName)
          .catch(e => console.error(`Background refresh failed for ${cityName}:`, e));
      }, 100);
    }
    
    return cachedData;
  }
  
  // If not in cache, fetch from API
  try {
    const params: TimelineParams = {
      location: `${lat},${lon}`,
      fields: [
        'temperature', 'temperatureApparent', 'temperatureMin', 'temperatureMax',
        'windSpeed', 'windDirection', 'humidity', 'precipitationProbability',
        'precipitationType', 'weatherCode', 'sunriseTime', 'sunsetTime',
        'visibility', 'moonPhase', 'uvIndex'
      ],
      timesteps: ['current', '1h', '1d'],
      units: API_CONFIG.UNITS
    };
    
    const data = await fetchWeatherTimeline(params);
    const weatherData = transformTomorrowData(data, cityName);
    
    // Add to cache
    WEATHER_CACHE.set(cacheKey, {
      data: weatherData,
      timestamp: Date.now(),
      accessCount: 1,
      lastAccessed: Date.now()
    });
    
    // Manage cache size
    manageCacheSize();
    
    return weatherData;
  } catch (error) {
    console.error(`Error fetching weather for ${cityName}:`, error);
    throw error;
  }
};

/**
 * Background refresh function to update cache without blocking UI
 */
async function refreshWeatherDataInBackground(lat: number, lon: number, cityName: string): Promise<void> {
  // Only proceed if we're not near API limits
  if (isNearApiLimit()) {
    console.log(`Skipping background refresh for ${cityName} due to API limit concerns`);
    return;
  }
  
  try {
    const params: TimelineParams = {
      location: `${lat},${lon}`,
      fields: [
        'temperature', 'temperatureApparent', 'temperatureMin', 'temperatureMax',
        'windSpeed', 'windDirection', 'humidity', 'precipitationProbability',
        'precipitationType', 'weatherCode', 'sunriseTime', 'sunsetTime',
        'visibility', 'moonPhase', 'uvIndex'
      ],
      timesteps: ['current', '1h', '1d'],
      units: API_CONFIG.UNITS
    };
    
    const data = await fetchWeatherTimeline(params);
    const weatherData = transformTomorrowData(data, cityName);
    
    // Update cache
    const cacheKey = cityName.toLowerCase();
    const existingEntry = WEATHER_CACHE.get(cacheKey);
    
    if (existingEntry) {
      WEATHER_CACHE.set(cacheKey, {
        data: weatherData,
        timestamp: Date.now(),
        accessCount: existingEntry.accessCount + 1,
        lastAccessed: Date.now()
      });
      console.log(`Background refresh completed for ${cityName}`);
    }
  } catch (error) {
    console.error(`Background refresh error for ${cityName}:`, error);
    // We don't rethrow in background processes
  }
}

/**
 * Fetches weather for city name, with enhanced caching and error handling 
 */
export const fetchWeatherForCity = async (cityName: string): Promise<WeatherData> => {
  // Create a cache key based on city name
  const cacheKey = cityName.toLowerCase();
  
  // Check if we have cached data
  const cachedData = WEATHER_CACHE.get(cacheKey);
  const now = Date.now();
  
  // If we have valid cached data, use it
  if (cachedData && (now - cachedData.timestamp < CACHE_CONFIG.STANDARD_DURATION)) {
    console.log(`Using cached weather data for ${cityName} (${Math.round((now - cachedData.timestamp) / 60000)} minutes old)`);
    
    // Update access stats
    WEATHER_CACHE.set(cacheKey, {
      data: cachedData.data,
      timestamp: cachedData.timestamp,
      accessCount: (cachedData.accessCount || 0) + 1,
      lastAccessed: now
    });
    
    return cachedData.data;
  }
  
  // Not in cache or expired, geocode the city name first
  try {
    // Simple geocoding to convert city name to lat/lon
    const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`;
    
    const geocodeResponse = await fetch(geocodeUrl);
    if (!geocodeResponse.ok) throw new Error('Geocoding failed');
    
    const geocodeData = await geocodeResponse.json();
    
    if (!geocodeData.results || geocodeData.results.length === 0) {
      throw new Error(`Could not find coordinates for ${cityName}`);
    }
    
    const { latitude, longitude, name } = geocodeData.results[0];
    
    // Now fetch weather data using the coordinates
    return await fetchWeatherForCoords(latitude, longitude, name || cityName);
  } catch (error) {
    console.error(`Error fetching weather for ${cityName}:`, error);
    throw error;
  }
}; 