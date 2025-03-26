/**
 * Weather API Configuration
 * 
 * This file outlines the endpoints and data structures needed to connect
 * the weather application to a third-party weather API service.
 * 
 * Recommended API providers:
 * - OpenWeatherMap (https://openweathermap.org/api)
 * - WeatherAPI (https://www.weatherapi.com/)
 * - AccuWeather (https://developer.accuweather.com/)
 */

import { WeatherData } from '../types';

// API configuration
export const API_CONFIG = {
  // Replace with your actual API key
  API_KEY: 'YOUR_API_KEY_HERE',
  // Base URL for the API
  BASE_URL: 'https://api.openweathermap.org/data/2.5',
  // Units for temperature (metric for Celsius, imperial for Fahrenheit)
  UNITS: 'imperial',
  // Language for descriptions
  LANG: 'en'
};

/**
 * Required Endpoints
 * 
 * The application needs the following data to function properly:
 * 1. Current weather (temperature, description, etc.)
 * 2. Hourly forecast (5 hours)
 * 3. 10-day forecast with detailed data
 */

/**
 * Endpoint 1: Current Weather
 * GET /weather?q={city}&units={units}&appid={API key}
 * 
 * This endpoint provides current weather data for a specific city.
 */
export const getCurrentWeather = async (city: string): Promise<any> => {
  const url = `${API_CONFIG.BASE_URL}/weather?q=${city}&units=${API_CONFIG.UNITS}&appid=${API_CONFIG.API_KEY}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Weather data fetch failed');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching current weather:', error);
    throw error;
  }
};

/**
 * Endpoint 2: 5-Day Forecast with 3-Hour Steps
 * GET /forecast?q={city}&units={units}&appid={API key}
 * 
 * This endpoint provides forecast data for 5 days with a 3-hour step.
 * We'll use this to extract the hourly forecast for the next 5 hours.
 */
export const getHourlyForecast = async (city: string): Promise<any> => {
  const url = `${API_CONFIG.BASE_URL}/forecast?q=${city}&units=${API_CONFIG.UNITS}&appid=${API_CONFIG.API_KEY}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Hourly forecast fetch failed');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching hourly forecast:', error);
    throw error;
  }
};

/**
 * Endpoint 3: One Call API (for 7-day forecast and more)
 * GET /onecall?lat={lat}&lon={lon}&exclude={part}&units={units}&appid={API key}
 * 
 * This endpoint provides current weather, minute forecast for 1 hour, hourly forecast for 48 hours,
 * daily forecast for 7 days, and historical data for 5 previous days.
 * 
 * Note: You need latitude and longitude instead of city name for this endpoint.
 * You can get lat/lon from the current weather endpoint first.
 */
export const getCompleteWeatherData = async (lat: number, lon: number): Promise<any> => {
  const url = `${API_CONFIG.BASE_URL}/onecall?lat=${lat}&lon=${lon}&exclude=minutely&units=${API_CONFIG.UNITS}&appid=${API_CONFIG.API_KEY}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Complete weather data fetch failed');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching complete weather data:', error);
    throw error;
  }
};

/**
 * Data Transformation
 * 
 * This function transforms the raw API responses into the format expected by the application.
 * This helps decouple the application from the specific API being used.
 */
export const transformWeatherData = (
  currentData: any,
  hourlyData: any, 
  completeData: any
): WeatherData => {
  // Map weather conditions to our application's icon types
  const mapWeatherToIconType = (condition: string): 'sunny' | 'cloudy' | 'rainy' | 'partly-cloudy' | 'thunderstorm' | 'snow' | 'foggy' | 'windy' => {
    const code = condition.toLowerCase();
    
    if (code.includes('thunderstorm')) return 'thunderstorm';
    if (code.includes('drizzle') || code.includes('rain')) return 'rainy';
    if (code.includes('snow')) return 'snow';
    if (code.includes('mist') || code.includes('fog')) return 'foggy';
    if (code.includes('clear')) return 'sunny';
    if (code.includes('clouds') && code.includes('few')) return 'partly-cloudy';
    if (code.includes('clouds')) return 'cloudy';
    if (code.includes('tornado') || code.includes('squall') || (currentData.wind && currentData.wind.speed > 20)) return 'windy';
    
    return 'sunny'; // Default
  };

  // Format hour string (e.g., "10 AM")
  const formatHour = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    let hours = date.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // Handle midnight (0 hours)
    return `${hours} ${ampm}`;
  };

  // Format day string (e.g., "Monday")
  const formatDay = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  // Extract hourly forecast (next 5 hours)
  const hourlyForecast = hourlyData.list.slice(0, 5).map((item: any) => ({
    hour: formatHour(item.dt),
    temp: Math.round(item.main.temp),
    description: item.weather[0].main
  }));

  // Extract 10-day forecast
  // Note: OpenWeatherMap's free plan only provides 7 days, so we'd need to duplicate or use another API for 10 days
  const tenDayForecast = completeData.daily.slice(0, 10).map((day: any) => ({
    day: formatDay(day.dt),
    high: Math.round(day.temp.max),
    low: Math.round(day.temp.min),
    description: day.weather[0].main,
    airQuality: {
      // Note: Air quality requires a separate API call to OpenWeatherMap's Air Pollution API
      // This is a placeholder - you would need to make another API call
      index: 35, // Placeholder
      description: 'Good' // Placeholder
    },
    hourlyDetails: Array(6).fill(null).map((_, i) => {
      // For demo purposes, we're creating simulated hourly details
      // In a real app, you would get this from detailed hourly data
      const hour = 6 + (i * 3);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 === 0 ? 12 : hour % 12;
      
      return {
        hour: `${displayHour} ${ampm}`,
        temp: Math.round(day.temp.day + (Math.random() * 10 - 5)), // Randomize around day temp
        rainChance: Math.round(day.pop * 100), // Probability of precipitation
        humidity: day.humidity
      };
    }),
    feelsLike: Math.round(day.feels_like.day),
    windSpeed: Math.round(day.wind_speed),
    uvIndex: Math.round(day.uvi)
  }));

  // Build the complete weather data object
  return {
    city: currentData.name,
    temperature: Math.round(currentData.main.temp),
    description: currentData.weather[0].main,
    hourlyForecast,
    tenDayForecast
  };
};

/**
 * Main Function to Fetch Weather Data
 * 
 * This function coordinates the multiple API calls needed and transforms the data.
 */
export const fetchWeatherForCity = async (city: string): Promise<WeatherData> => {
  try {
    // Step 1: Get current weather (also gives us lat/lon)
    const currentData = await getCurrentWeather(city);
    
    // Step 2: Get hourly forecast
    const hourlyData = await getHourlyForecast(city);
    
    // Step 3: Get complete weather data using lat/lon
    const { lat, lon } = currentData.coord;
    const completeData = await getCompleteWeatherData(lat, lon);
    
    // Step 4: Transform the data into our application format
    return transformWeatherData(currentData, hourlyData, completeData);
  } catch (error) {
    console.error(`Error fetching weather data for ${city}:`, error);
    throw error;
  }
};

/**
 * API Endpoints for Additional Features
 */

/**
 * Air Quality Data
 * GET /air_pollution?lat={lat}&lon={lon}&appid={API key}
 * 
 * This endpoint provides current, forecast and historical air pollution data.
 */
export const getAirQuality = async (lat: number, lon: number): Promise<any> => {
  const url = `${API_CONFIG.BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${API_CONFIG.API_KEY}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Air quality fetch failed');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching air quality data:', error);
    throw error;
  }
};

/**
 * Weather Alerts
 * 
 * Weather alerts are included in the One Call API response if available.
 * To extract alerts from the complete weather data:
 */
export const extractWeatherAlerts = (completeData: any) => {
  if (completeData.alerts && completeData.alerts.length > 0) {
    return completeData.alerts.map((alert: any) => ({
      senderName: alert.sender_name,
      event: alert.event,
      start: new Date(alert.start * 1000).toLocaleString(),
      end: new Date(alert.end * 1000).toLocaleString(),
      description: alert.description
    }));
  }
  return [];
};

/**
 * Usage Example:
 * 
 * import { fetchWeatherForCity } from './api/weatherApiConfig';
 * 
 * // In a React component
 * useEffect(() => {
 *   const loadWeatherData = async () => {
 *     try {
 *       const cityData = await fetchWeatherForCity('Paris');
 *       setCities(prevCities => [...prevCities, cityData]);
 *     } catch (error) {
 *       console.error('Failed to load weather data', error);
 *     }
 *   };
 *   
 *   loadWeatherData();
 * }, []);
 */ 