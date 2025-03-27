import { WeatherData } from '../types';
import { 
  fetchWeatherForCity, 
  getCachedWeatherData,
  isNearApiLimit,
  API_USAGE,
  CACHE_CONFIG
} from '../api/tomorrowApiConfig';

/**
 * Options for batch fetching
 */
interface BatchFetchOptions {
  prioritizeCached?: boolean;  // Prefer cached data when available
  maxConcurrent?: number;      // Maximum number of concurrent API calls
  forceRefresh?: boolean;      // Force refresh even if cached data exists
  respectApiLimits?: boolean;  // Respect API limits and use cached data when near limits
}

/**
 * Result of a batch fetch operation
 */
interface BatchFetchResult {
  data: Record<string, WeatherData>;  // Weather data by city name
  errors: Record<string, string>;     // Error messages by city name
  apiCallsMade: number;               // Number of API calls made in this batch
  fromCache: string[];                // List of cities that used cached data
}

/**
 * Fetches weather data for multiple cities in an optimized batch
 * 
 * Features:
 * - Uses cached data when available
 * - Respects API limits
 * - Limits concurrent API calls
 * - Prioritizes frequently accessed cities
 * 
 * @param cities List of cities to fetch data for
 * @param options Batch fetch options
 * @returns Promise resolving to BatchFetchResult
 */
export async function batchFetchWeather(
  cities: string[],
  options: BatchFetchOptions = {}
): Promise<BatchFetchResult> {
  const {
    prioritizeCached = true,
    maxConcurrent = 3,
    forceRefresh = false,
    respectApiLimits = true
  } = options;

  // Prepare result objects
  const result: BatchFetchResult = {
    data: {},
    errors: {},
    apiCallsMade: 0,
    fromCache: []
  };

  // Skip if no cities
  if (!cities.length) return result;

  // Check if we should avoid API calls due to rate limits
  const useOnlyCachedData = respectApiLimits && isNearApiLimit();

  // First pass: collect cached data
  if (prioritizeCached || useOnlyCachedData) {
    for (const city of cities) {
      const cachedData = getCachedWeatherData(
        city, 
        forceRefresh ? -1 : CACHE_CONFIG.STANDARD_DURATION
      );
      
      if (cachedData) {
        result.data[city] = cachedData;
        result.fromCache.push(city);
      }
    }
  }

  // Filter out cities that were loaded from cache
  const citiesToFetch = cities.filter(city => !result.data[city]);

  // If we're near API limits and should respect them, don't fetch remaining cities
  if (useOnlyCachedData) {
    // Add errors for cities we couldn't fetch
    for (const city of citiesToFetch) {
      result.errors[city] = "API rate limit approaching. Try again later.";
    }
    return result;
  }

  // Second pass: fetch remaining cities with concurrency control
  if (citiesToFetch.length > 0) {
    // Process in batches to control concurrency
    for (let i = 0; i < citiesToFetch.length; i += maxConcurrent) {
      const batch = citiesToFetch.slice(i, i + maxConcurrent);
      
      // Fetch all cities in this batch concurrently
      const batchResults = await Promise.allSettled(
        batch.map(city => fetchWeatherForCity(city))
      );
      
      // Process batch results
      batchResults.forEach((batchResult, index) => {
        const city = batch[index];
        
        if (batchResult.status === 'fulfilled') {
          result.data[city] = batchResult.value;
          result.apiCallsMade += 1;
        } else {
          // Try to get cached data for failed requests, even if expired
          const cachedData = getCachedWeatherData(city, Infinity);
          
          if (cachedData) {
            result.data[city] = cachedData;
            result.fromCache.push(city);
            result.errors[city] = `API error: ${batchResult.reason}. Using cached data.`;
          } else {
            result.errors[city] = `Failed to fetch: ${batchResult.reason}`;
          }
        }
      });
      
      // If we've reached API limits, stop fetching more batches
      if (isNearApiLimit() && respectApiLimits) {
        // Add errors for remaining cities
        for (let j = i + maxConcurrent; j < citiesToFetch.length; j++) {
          const city = citiesToFetch[j];
          // Try to get cached data for skipped cities, even if expired
          const cachedData = getCachedWeatherData(city, Infinity);
          
          if (cachedData) {
            result.data[city] = cachedData;
            result.fromCache.push(city);
            result.errors[city] = "API limit reached. Using cached data.";
          } else {
            result.errors[city] = "API limit reached. Try again later.";
          }
        }
        break;
      }
    }
  }

  return result;
}

/**
 * Prefetches and caches weather data for a list of cities in the background
 * 
 * Useful for preloading data for cities the user might visit next
 * 
 * @param cities List of cities to prefetch
 * @param options Batch fetch options
 */
export async function prefetchCities(
  cities: string[],
  options: BatchFetchOptions = {}
): Promise<void> {
  // Don't prefetch if we're near API limits
  if (isNearApiLimit()) return;
  
  // Set defaults for prefetching
  const prefetchOptions: BatchFetchOptions = {
    prioritizeCached: true,
    maxConcurrent: 1, // Very conservative for background fetching
    forceRefresh: false,
    respectApiLimits: true,
    ...options
  };
  
  // Fetch in the background, but don't wait for result
  batchFetchWeather(cities, prefetchOptions)
    .catch(err => console.warn("Background prefetch error:", err));
}

export default {
  batchFetchWeather,
  prefetchCities
}; 