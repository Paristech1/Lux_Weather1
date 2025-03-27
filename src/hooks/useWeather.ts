import { useState, useEffect, useCallback } from 'react';
import { WeatherData } from '../types';
import { 
  fetchWeatherForCity, 
  getCachedWeatherData, 
  API_USAGE,
  getRemainingApiCalls,
  getRemainingDailyApiCalls,
  isNearApiLimit
} from '../api/tomorrowApiConfig';
import { weatherDataAgent } from '../api/llmProcessor';

// Types for the hook
interface UseWeatherOptions {
  enableAutoRefresh?: boolean;
  refreshInterval?: number; // in minutes
  useLLMEnhancement?: boolean;
}

interface UseWeatherResult {
  weatherData: WeatherData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  apiStatus: {
    hourlyCallsLeft: number;
    dailyCallsLeft: number;
    isNearLimit: boolean;
    showWarning: boolean;
  };
}

/**
 * Custom hook for efficient weather data fetching
 * 
 * Features:
 * - Caching with intelligent cache invalidation
 * - Auto-refresh with customizable interval
 * - Error handling with fallback to cached data
 * - API usage tracking
 * - Optional LLM enhancement for weather insights
 */
export function useWeather(
  cityName: string,
  options: UseWeatherOptions = {}
): UseWeatherResult {
  // Default options
  const {
    enableAutoRefresh = true,
    refreshInterval = 30, // 30 minutes default
    useLLMEnhancement = true
  } = options;

  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<number>(0);
  
  // API status tracking
  const [apiStatus, setApiStatus] = useState({
    hourlyCallsLeft: getRemainingApiCalls(),
    dailyCallsLeft: getRemainingDailyApiCalls(),
    isNearLimit: isNearApiLimit(),
    showWarning: API_USAGE.showLimitWarning
  });

  // Update API status regularly
  useEffect(() => {
    const updateApiStatus = () => {
      setApiStatus({
        hourlyCallsLeft: getRemainingApiCalls(),
        dailyCallsLeft: getRemainingDailyApiCalls(),
        isNearLimit: isNearApiLimit(),
        showWarning: API_USAGE.showLimitWarning
      });
    };

    // Initial update
    updateApiStatus();

    // Update every minute
    const interval = setInterval(updateApiStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch data function
  const fetchData = useCallback(async (force: boolean = false) => {
    if (isLoading && !force) return; // Prevent concurrent fetches
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Check cache first if not forced
      if (!force) {
        const cachedData = getCachedWeatherData(cityName);
        if (cachedData) {
          setWeatherData(cachedData);
          setIsLoading(false);
          setLastFetched(Date.now());
          return;
        }
      }
      
      // If near API limit, warn but continue with cached data if available
      if (isNearApiLimit() && !force) {
        const cachedData = getCachedWeatherData(cityName, Infinity); // Use any cache regardless of age
        if (cachedData) {
          setWeatherData(cachedData);
          setError("API limit approaching. Using cached data.");
          setIsLoading(false);
          return;
        }
      }
      
      // Fetch from API
      let data = await fetchWeatherForCity(cityName);
      
      // Enhance with LLM if enabled
      if (useLLMEnhancement && data) {
        try {
          data = await weatherDataAgent(data, data);
        } catch (llmError) {
          console.warn("LLM enhancement failed, using base weather data:", llmError);
        }
      }
      
      setWeatherData(data);
      setLastFetched(Date.now());
    } catch (err) {
      console.error("Error fetching weather:", err);
      
      // Try to get any cached data as fallback, even if expired
      const cachedData = getCachedWeatherData(cityName, Infinity);
      if (cachedData) {
        setWeatherData(cachedData);
        setError(`Error refreshing: ${err instanceof Error ? err.message : String(err)}. Using cached data.`);
      } else {
        setError(`Failed to fetch weather: ${err instanceof Error ? err.message : String(err)}`);
      }
    } finally {
      setIsLoading(false);
      
      // Update API status after fetch
      setApiStatus({
        hourlyCallsLeft: getRemainingApiCalls(),
        dailyCallsLeft: getRemainingDailyApiCalls(),
        isNearLimit: isNearApiLimit(),
        showWarning: API_USAGE.showLimitWarning
      });
    }
  }, [cityName, useLLMEnhancement]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto refresh on interval if enabled
  useEffect(() => {
    if (!enableAutoRefresh) return;
    
    const shouldRefresh = () => {
      const now = Date.now();
      const minutesSinceLastFetch = (now - lastFetched) / (1000 * 60);
      return minutesSinceLastFetch >= refreshInterval;
    };
    
    const intervalId = setInterval(() => {
      if (shouldRefresh() && !isNearApiLimit()) {
        fetchData();
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(intervalId);
  }, [fetchData, lastFetched, refreshInterval, enableAutoRefresh]);

  // Refetch function for manual refresh
  const refetch = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  return {
    weatherData,
    isLoading,
    error,
    refetch,
    apiStatus
  };
}

export default useWeather; 