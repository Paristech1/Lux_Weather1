import React, { useState, useRef, TouchEvent, useEffect } from 'react';
import { MapPin, Plus, ChevronLeft, ChevronRight, X, AlertCircle, Lightbulb } from 'lucide-react';
import WeatherIcon from './components/WeatherIcon';
import DayDetail from './components/DayDetail';
import { WeatherData } from './types';
import { fetchWeatherForCity, API_USAGE, getRemainingApiCalls, isNearApiLimit } from './api/tomorrowApiConfig';
import { weatherDataAgent } from './api/llmProcessor';

// Import the mock data for initial loading or fallback
import { weatherData, parisWeather, newYorkWeather, miamiWeather, denverWeather, chicagoWeather, sanFranciscoWeather } from './data';

// Add this before the App function
const weatherConditions = [
  "Sunny", 
  "Partly Cloudy",
  "Cloudy",
  "Rainy",
  "Thunderstorm",
  "Snow",
  "Foggy",
  "Windy"
];

function App() {
  // State for weather data
  const [cities, setCities] = useState<WeatherData[]>([
    parisWeather,
    newYorkWeather,
  ]);
  
  // Helper function to convert description strings to icon types
  const getWeatherIconType = (description: string | undefined = ''): 'sunny' | 'cloudy' | 'rainy' | 'partly-cloudy' | 'thunderstorm' | 'snow' | 'foggy' | 'windy' => {
    if (!description) return 'partly-cloudy';
    
    const desc = description.toLowerCase();
    
    if (desc === 'sunny' || desc === 'clear') return 'sunny';
    if (desc === 'partly-cloudy' || desc.includes('partly')) return 'partly-cloudy';
    if (desc === 'cloudy' || desc.includes('cloud')) return 'cloudy';
    if (desc === 'rainy' || desc.includes('rain') || desc.includes('drizzle')) return 'rainy';
    if (desc === 'thunderstorm' || desc.includes('thunder') || desc.includes('storm')) return 'thunderstorm';
    if (desc === 'snow' || desc.includes('snow') || desc.includes('ice') || desc.includes('sleet')) return 'snow';
    if (desc === 'foggy' || desc.includes('fog') || desc.includes('mist')) return 'foggy';
    if (desc === 'windy' || desc.includes('wind')) return 'windy';
    
    // Default fallback
    return 'partly-cloudy';
  };
  
  const [selectedCity, setSelectedCity] = useState<number>(0);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [apiCallsRemaining, setApiCallsRemaining] = useState<number>(25);
  
  // Update remaining API calls
  useEffect(() => {
    const updateApiStatus = () => {
      setApiCallsRemaining(getRemainingApiCalls());
    };
    
    // Check initially
    updateApiStatus();
    
    // Check every minute
    const interval = setInterval(updateApiStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  // Touch/swipe functionality
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const swipeableRef = useRef<HTMLDivElement>(null);
  
  // UI state
  const [rimColor, setRimColor] = useState<string>('#CFA94D');
  const [isOscillating, setIsOscillating] = useState<boolean>(false);
  const [showCityDropdown, setShowCityDropdown] = useState<boolean>(false);

  // Sample cities for demonstration
  const availableCities = [
    { name: "New York", temp: 58 },
    { name: "Miami", temp: 89 },
    { name: "Denver", temp: 32 },
    { name: "Chicago", temp: 55 },
    { name: "San Francisco", temp: 60 },
    { name: "Seattle", temp: 52 },
  ];

  // Add new state for custom city input
  const [customCityName, setCustomCityName] = useState<string>('');
  const [searchResults, setSearchResults] = useState<{name: string, country: string, admin1: string, admin2: string, displayName: string}[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Function to search for cities
  const searchCities = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    
    try {
      // Use Open-Meteo geocoding API to search for cities
      const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=10&language=en&format=json`);
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        // Format results with more detailed location info but no temperature
        const formattedResults = data.results.map((result: any) => ({
          name: result.name,
          country: result.country,
          admin1: result.admin1 || '', // State/Province/Region
          admin2: result.admin2 || '', // County/District
          displayName: formatLocationName(result)
        }));
        
        setSearchResults(formattedResults);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error searching for cities:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Helper function to format location names properly
  const formatLocationName = (location: any): string => {
    let parts = [];
    
    // Always include the city name
    parts.push(location.name);
    
    // Add state/province if available
    if (location.admin1) {
      parts.push(location.admin1);
    }
    
    // Add country if available and not USA (for US cities, state is enough)
    if (location.country && location.country !== 'United States') {
      parts.push(location.country);
    }
    
    return parts.join(', ');
  };
  
  // Extract just the city name from a full location string
  const extractCityName = (fullLocationName: string): string => {
    // Return just the first part (the city name)
    return fullLocationName.split(',')[0].trim();
  };
  
  // Use debouncing for search to avoid too many API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (customCityName.trim()) {
        searchCities(customCityName);
      }
    }, 500); // Wait 500ms after typing stops
    
    return () => clearTimeout(timeoutId);
  }, [customCityName]);

  // Initialize with real data on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        // Fetch data for Paris and New York
        const [parisData, nyData] = await Promise.all([
          fetchCityData('Paris'),
          fetchCityData('New York')
        ]);
        
        // If we successfully got data, update the state
        if (parisData && nyData) {
          setCities([parisData, nyData]);
        }
      } catch (err) {
        console.error('Error loading initial data:', err);
        setError('Failed to load weather data. Using offline data.');
        // Fallback to mock data (already set in state)
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialData();
  }, []);
  
  // Function to fetch city data with LLM enhancement
  const fetchCityData = async (cityName: string): Promise<WeatherData> => {
    try {
      // First fetch the raw weather data from Tomorrow.io
      const rawData = await fetchWeatherForCity(cityName);
      
      // Then enhance it with the LLM agent
      const enhancedData = await weatherDataAgent(rawData, rawData);
      
      // Update API call counter display
      try {
        setApiCallsRemaining(getRemainingApiCalls());
      } catch (e) {
        // Ignore if the function is not available
      }
      
      return enhancedData;
    } catch (error: unknown) {
      console.error(`Error fetching data for ${cityName}:`, error);
      
      // Convert error to string safely
      const errorMessage = error instanceof Error 
        ? error.message 
        : String(error);
      
      // Check if it's a rate limit error (429)
      if (errorMessage.includes('429') || errorMessage.includes('API limit')) {
        setError(`API limit reached. Using offline data for ${cityName}.`);
      } else {
        // For other errors, set a generic error message
        setError(`Failed to fetch weather for ${cityName}. Using offline data.`);
      }
      
      // Return mock data in either case
      return getMockDataForCity(cityName);
    }
  };
  
  // Helper function to get mock data for a city
  const getMockDataForCity = (cityName: string): WeatherData => {
    const lowerCityName = cityName.toLowerCase();
    
    // Check if we have predefined mock data for this city
    if (lowerCityName.includes('new york')) {
      return newYorkWeather;
    } else if (lowerCityName.includes('miami')) {
      return miamiWeather;
    } else if (lowerCityName.includes('denver')) {
      return denverWeather;
    } else if (lowerCityName.includes('chicago')) {
      return chicagoWeather;
    } else if (lowerCityName.includes('san francisco')) {
      return sanFranciscoWeather;
    } 
    
    // Create a placeholder using Paris data as a template
    return {
      ...parisWeather,
      city: cityName,
      temperature: Math.floor(50 + Math.random() * 30), // Random temp between 50-80
      description: ['Sunny', 'Partly Cloudy', 'Cloudy'][Math.floor(Math.random() * 3)]
    };
  };

  // Fix the addCity function to correctly map the city data to the required structure
  const addCity = (cityName: string, displayName?: string) => {
    // Check if we already have maximum cities
    if (cities.length >= 5) return;

    // Store the display name (full location) but use simple city name for display
    const simpleCityName = extractCityName(cityName);
    const fullLocationName = displayName || cityName;

    // Check if the city already exists
    const cityExists = cities.some(city => 
      typeof city === 'string' 
        ? city === fullLocationName 
        : city.city.toLowerCase() === fullLocationName.toLowerCase()
    );

    if (cityExists) {
      // If it does, select that city instead of adding it again
      const cityIndex = cities.findIndex(city => 
        typeof city === 'string' 
          ? city === fullLocationName 
          : city.city.toLowerCase() === fullLocationName.toLowerCase()
      );
      setSelectedCity(cityIndex);
      setShowCityDropdown(false);
      setCustomCityName('');
      setSearchResults([]);
      return;
    }

    // Show loading
    setLoading(true);

    // Create a proper WeatherData object for the new city
    const fetchAndAddCity = async () => {
      try {
        // Try to fetch real data first - use full location for API but display simple name
        const cityData = await fetchCityData(fullLocationName);
        
        // Override the city name to just the simple version
        const cityDataWithSimpleName = {
          ...cityData,
          city: simpleCityName,
          fullLocationName: fullLocationName // Store the full name for reference but don't display it
        };
        
        // Update the cities array with real data
        setCities(prev => [...prev, cityDataWithSimpleName]);
        
        // Select the newly added city
        setSelectedCity(cities.length);
      } catch (error) {
        console.error(`Error adding city ${fullLocationName}:`, error);
        
        // If fetching real data fails, create mock data
        const mockTemp = Math.floor(Math.random() * 50) + 50;
        const mockDescription = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
        
        // Create mock data for the new city with all required properties
        const newWeatherData: WeatherData = {
          city: simpleCityName, // Just use the simple name for display
          fullLocationName: fullLocationName, // Store the full location info
          temperature: mockTemp,
          description: mockDescription,
          hourlyForecast: generateMockHourlyForecast(),
          tenDayForecast: generateMockTenDayForecast(),
          humidity: Math.floor(Math.random() * 40) + 40,
          windSpeed: Math.floor(Math.random() * 20) + 5,
          precipitation: Math.floor(Math.random() * 70),
          uvIndex: Math.floor(Math.random() * 10) + 1,
          airQuality: {
            index: Math.floor(Math.random() * 150) + 30,
            description: getAirQualityDescription(Math.floor(Math.random() * 150) + 30)
          },
          sunrise: "6:45 AM",
          sunset: "7:30 PM"
        };
        
        // Add the new data to cities
        setCities(prev => [...prev, newWeatherData]);
        
        // Select the newly added city
        setSelectedCity(cities.length);
      } finally {
        setShowCityDropdown(false);
        setCustomCityName('');
        setSearchResults([]);
        setLoading(false);
      }
    };
    
    fetchAndAddCity();
  };

  // Fix the helper function to generate mock hourly forecast
  const generateMockHourlyForecast = () => {
    const hourlyForecast = [];
    const currentHour = new Date().getHours();
    
    for (let i = 0; i < 24; i++) {
      const hour = (currentHour + i) % 24;
      const hourLabel = hour === 0 ? "12 AM" : hour === 12 ? "12 PM" : hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
      
      hourlyForecast.push({
        hour: hourLabel,
        temp: Math.floor(Math.random() * 15) + 60,
        description: weatherConditions[Math.floor(Math.random() * weatherConditions.length)]
      });
    }
    
    return hourlyForecast;
  };

  // Fix the helper function to generate mock 10-day forecast
  const generateMockTenDayForecast = () => {
    const forecast = [];
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const currentDay = new Date().getDay();
    
    for (let i = 0; i < 10; i++) {
      const dayIndex = (currentDay + i) % 7;
      const dayName = days[dayIndex];
      const tempHigh = Math.floor(Math.random() * 20) + 65;
      const tempLow = tempHigh - Math.floor(Math.random() * 15) - 5;
      
      forecast.push({
        day: i === 0 ? "Today" : dayName,
        high: tempHigh,
        low: tempLow,
        description: weatherConditions[Math.floor(Math.random() * weatherConditions.length)],
        airQuality: {
          index: Math.floor(Math.random() * 150) + 30,
          description: getAirQualityDescription(Math.floor(Math.random() * 150) + 30)
        },
        feelsLike: Math.floor(Math.random() * 10) + tempHigh - 5,
        windSpeed: Math.floor(Math.random() * 20) + 5,
        uvIndex: Math.floor(Math.random() * 10) + 1,
        hourlyDetails: Array(24).fill(0).map((_, idx) => ({
          hour: idx === 0 ? "12 AM" : idx === 12 ? "12 PM" : idx < 12 ? `${idx} AM` : `${idx - 12} PM`,
          temp: Math.floor(Math.random() * 15) + 60,
          rainChance: Math.floor(Math.random() * 100),
          humidity: Math.floor(Math.random() * 40) + 40
        }))
      });
    }
    
    return forecast;
  };

  // Helper function to get air quality description
  const getAirQualityDescription = (aqi: number) => {
    if (aqi <= 50) return "Good";
    if (aqi <= 100) return "Moderate";
    if (aqi <= 150) return "Unhealthy for Sensitive Groups";
    if (aqi <= 200) return "Unhealthy";
    if (aqi <= 300) return "Very Unhealthy";
    return "Hazardous";
  };

  // Handle custom city form submission
  const handleCustomCitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customCityName.trim()) {
      addCity(customCityName.trim());
    }
  };
  
  // Function to remove a city
  const removeCity = (index: number) => {
    // Don't allow removing all cities
    if (cities.length <= 1) {
      setError("Cannot remove the last city.");
      return;
    }
    
    const newCities = [...cities];
    newCities.splice(index, 1);
    setCities(newCities);
    
    // Adjust selected city if needed
    if (selectedCity >= newCities.length) {
      setSelectedCity(newCities.length - 1);
    }
  };
  
  // Function to refresh a city's data
  const refreshCityData = async (index: number) => {
    try {
      setLoading(true);
      const cityName = cities[index].city;
      
      // This will handle API limits and use mock data if needed
      const updatedData = await fetchCityData(cityName);
      
      // Update the city's data in the state
      setCities(prevCities => 
        prevCities.map((city, i) => i === index ? updatedData : city)
      );
    } catch (err: any) {
      console.error(`Error refreshing city data:`, err);
      // Error already handled by fetchCityData, just set loading to false
    } finally {
      setLoading(false);
    }
  };

  // Touch handlers for swipe functionality
  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (!touchStartX.current || !touchStartY.current) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartX.current;
    const deltaY = touch.clientY - touchStartY.current;

    // Check if touch is within the swipeable area
    const element = swipeableRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const touchY = touch.clientY - rect.top;
    const areaHeight = rect.height;
    
    // Only process horizontal swipes in the top quarter of the main screen
    if (Math.abs(deltaY) < Math.abs(deltaX) && touchY < areaHeight) {
      if (Math.abs(deltaX) > 50) { // Minimum swipe distance
        if (deltaX > 0 && selectedCity > 0) {
          setSelectedCity(prev => prev - 1);
        } else if (deltaX < 0 && selectedCity < cities.length - 1) {
          setSelectedCity(prev => prev + 1);
        }
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  // Function to determine rim color based on weather description
  const determineRimColor = (description: string): { color: string, oscillate: boolean, cssClass: string } => {
    const lowerDesc = description.toLowerCase();
    
    if (lowerDesc.includes('sunny') || lowerDesc.includes('clear')) {
      return { color: '#CFA94D', oscillate: false, cssClass: '' }; // Gold for sunny
    } else if (lowerDesc.includes('partly cloudy')) {
      return { color: '#4ECDC4', oscillate: true, cssClass: 'oscillating-rim' }; // Oscillate between cyan and gray for partly cloudy
    } else if (lowerDesc.includes('cloudy')) {
      return { color: '#C0C0C0', oscillate: false, cssClass: 'silver-rim' }; // Silverish for cloudy
    } else if (lowerDesc.includes('rain')) {
      return { color: '#4682B4', oscillate: false, cssClass: '' }; // Steel blue for rainy
    } else if (lowerDesc.includes('snow') || lowerDesc.includes('ice') || lowerDesc.includes('sleet')) {
      return { color: '#FFFFFF', oscillate: false, cssClass: 'snow-rim' }; // White for snow with animation
    } else {
      return { color: '#CFA94D', oscillate: false, cssClass: '' }; // Default gold
    }
  };

  // Effect to update rim color when city or day changes
  useEffect(() => {
    if (cities.length === 0 || selectedCity >= cities.length) return;
    
    const currentDescription = selectedDay !== null 
      ? cities[selectedCity].tenDayForecast[selectedDay].description || cities[selectedCity].description
      : cities[selectedCity].description;
    
    const { color, oscillate, cssClass } = determineRimColor(currentDescription);
    setRimColor(color);
    setIsOscillating(oscillate);
    setRimCssClass(cssClass);
  }, [selectedCity, selectedDay, cities]);

  // Add state for rim CSS class
  const [rimCssClass, setRimCssClass] = useState<string>('');

  // Effect to handle oscillation if needed
  useEffect(() => {
    if (!isOscillating) return;
    
    let colorToggle = false;
    const oscillationInterval = setInterval(() => {
      colorToggle = !colorToggle;
      // Change to oscillate between cyan and gray for partly cloudy
      setRimColor(colorToggle ? '#4ECDC4' : '#A9A9A9'); 
    }, 3000); // Change every 3 seconds
    
    return () => clearInterval(oscillationInterval);
  }, [isOscillating]);

  // Get the current city data
  const currentCity = cities[selectedCity] || parisWeather; // Fallback to Paris if no city selected

  // Custom rim style
  const rimStyle = {
    border: `2px solid ${rimColor}`,
    borderRadius: '30px',
    boxShadow: `0 0 8px ${rimColor}70`, // 70 for 44% opacity (similar to rgba(207,169,77,0.4))
    transition: isOscillating ? 'none' : 'border-color 1s, box-shadow 1s',
  };

  return (
    <div className="min-h-screen bg-[#111] flex items-center justify-center p-4 text-base">
      <div 
        className={`w-full max-w-[390px] min-h-[calc(100vh-2rem)] md:min-h-[667px] md:w-[350px] bg-[#000] rounded-[30px] overflow-hidden relative shadow-2xl shadow-black/60 ${rimCssClass}`}
        style={rimCssClass ? {} : rimStyle}
      >
        {selectedDay !== null ? (
          <DayDetail 
            day={currentCity.tenDayForecast[selectedDay]} 
            onClose={() => setSelectedDay(null)} 
          />
        ) : (
          <div className="p-4 sm:p-6 md:p-8">
            {/* Swipeable Area */}
            <div
              ref={swipeableRef}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              className="mb-6 relative"
            >
              {/* API Usage Indicator */}
              {isNearApiLimit() && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-[#333] px-2 py-1 rounded-full flex items-center gap-1 z-10">
                  <AlertCircle size={12} className={apiCallsRemaining <= 2 ? 'text-red-500' : 'text-amber-500'} />
                  <span className="text-xs text-white">API: {apiCallsRemaining} calls left</span>
                </div>
              )}
              
              {/* Navigation Arrows - Positioned absolutely left and right */}
              {selectedCity > 0 && (
                <button 
                  onClick={() => setSelectedCity(prev => prev - 1)}
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center bg-[#111] text-[#cfa94d] hover:bg-[#222] transition-colors z-10"
                  aria-label="Previous city"
                >
                  <ChevronLeft size={18} />
                </button>
              )}
              
              {selectedCity < cities.length - 1 && (
                <button 
                  onClick={() => setSelectedCity(prev => prev + 1)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center bg-[#111] text-[#cfa94d] hover:bg-[#222] transition-colors z-10"
                  aria-label="Next city"
                >
                  <ChevronRight size={18} />
                </button>
              )}
              
              {/* Refresh Button - Positioned to mirror the "+" button */}
              <button
                onClick={() => refreshCityData(selectedCity)}
                disabled={loading}
                className="absolute top-4 w-8 h-8 left-0 rounded-full flex items-center justify-center bg-[#111] text-[#cfa94d] hover:bg-[#222] transition-colors z-10" 
                aria-label="Refresh weather data"
              >
                {loading ? (
                  <div className="w-3 h-3 border-2 border-[#cfa94d] border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M9 6L4 12L9 6Z" fill="currentColor"/>
                    <path d="M9 6L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M4 12L10 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>

              {/* Add city button positioned to balance with refresh button */}
              <button
                onClick={() => setShowCityDropdown(true)}
                className="absolute right-0 top-4 w-8 h-8 rounded-full flex items-center justify-center bg-[#111] text-[#cfa94d] hover:bg-[#222] transition-colors z-10"
                aria-label="Add city"
              >
                <Plus size={18} />
              </button>
              
              {/* City Selector with Remove Option */}
              <div className="flex flex-col items-center mb-6 md:mb-8">
                {/* City Dropdown */}
                {showCityDropdown && (
                  <div className="absolute top-0 left-0 w-full h-full bg-black/90 z-20 flex items-center justify-center p-6">
                    <div className="bg-[#111] w-full max-w-[280px] rounded-2xl p-4 border border-[#222]" style={{ borderColor: rimColor }}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-playfair" style={{ color: rimColor }}>Select a City</h3>
                        <button 
                          onClick={() => {
                            setShowCityDropdown(false);
                            setCustomCityName('');
                            setSearchResults([]);
                          }}
                          className="text-[#cfa94d] hover:text-[#b8923f]"
                        >
                          <X size={18} />
                        </button>
                      </div>
                      
                      {/* Custom City Input */}
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        if (searchResults.length > 0) {
                          // Pass both the display name and full location info
                          addCity(searchResults[0].displayName, searchResults[0].displayName);
                        } else if (customCityName.trim()) {
                          addCity(customCityName.trim());
                        }
                      }} className="mb-4">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={customCityName}
                            onChange={(e) => setCustomCityName(e.target.value)}
                            placeholder={cities.length >= 5 ? "Maximum cities reached" : "Enter a city name"}
                            className="flex-1 bg-[#222] border border-[#333] rounded px-3 py-2 text-[#f2f0e6] placeholder:text-[#666] focus:outline-none focus:border-[#cfa94d]"
                            disabled={cities.length >= 5}
                          />
                          <button
                            type="submit"
                            disabled={!customCityName.trim() || cities.length >= 5}
                            className="bg-[#cfa94d] text-black px-3 py-2 rounded disabled:opacity-50"
                          >
                            Add
                          </button>
                        </div>
                      </form>
                      
                      {/* Search Results */}
                      {isSearching && (
                        <div className="flex justify-center my-3">
                          <div className="w-5 h-5 border-2 border-[#cfa94d] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                      
                      {searchResults.length > 0 && (
                        <div className="mb-4 space-y-1 max-h-[200px] overflow-y-auto">
                          <p className="text-[#888] text-xs mb-1">Location results:</p>
                          {searchResults.map((city, index) => (
                            <button
                              key={index}
                              className="w-full text-left px-3 py-2 rounded transition-colors flex justify-between items-center hover:bg-[#222]"
                              onClick={() => {
                                if (cities.length < 5) {
                                  // Pass both the display name and full location info
                                  addCity(city.displayName, city.displayName);
                                }
                              }}
                              disabled={cities.length >= 5}
                            >
                              <div className="text-[#f2f0e6]">{city.displayName}</div>
                            </button>
                          ))}
                        </div>
                      )}
                      
                      {/* City Count Indicator */}
                      <div className="mb-3 text-[#888] text-xs flex justify-between items-center">
                        <span>Cities: {cities.length}/5</span>
                        {cities.length >= 5 && (
                          <span className="text-amber-500 flex items-center gap-1">
                            <AlertCircle size={12} />
                            Maximum reached
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Current Weather Overview */}
                <div className="text-center mt-2">
                  <div className="flex items-center justify-center gap-1 sm:gap-2 mx-auto mb-2">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-playfair text-[#cfa94d]">
                      {currentCity.city}
                    </h1>
                  </div>

                  <p className="text-[#f2f0e6] text-sm md:text-base mb-2">{currentCity.description}</p>
                  
                  <div className="flex items-center justify-center">
                    <div className="mr-4 flex-shrink-0">
                      <WeatherIcon 
                        type={getWeatherIconType(currentCity.description)} 
                        size="large"
                      />
                    </div>
                    <div className="text-7xl sm:text-8xl font-extralight text-[#f2f0e6] temperature">
                      {currentCity.temperature}<span className="text-4xl align-top">°</span>
                    </div>
                  </div>
                  
                  {/* Weather insights from LLM if available */}
                  {currentCity.weatherInsights && (
                    <div className="flex items-center justify-center mt-2 mb-1 text-[#b8923f]">
                      <Lightbulb size={14} className="mr-1 flex-shrink-0" />
                      <p className="text-xs italic">{currentCity.weatherInsights}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Hourly Forecast */}
              <div className="mb-6 md:mb-8">
                <div className="flex justify-between overflow-x-auto pb-2 no-scrollbar">
                  {currentCity.hourlyForecast.map((hour: any, index: number) => (
                    <div key={index} className="flex flex-col items-center mx-2 flex-shrink-0">
                      <div className="text-[#f2f0e6] text-xs md:text-sm">{hour.hour}</div>
                      <WeatherIcon 
                        type={getWeatherIconType(hour.description)} 
                        size="small"
                        className="my-1"
                      />
                      <div className="text-[#b8923f] text-sm md:text-base temperature">
                        {hour.temp}<span className="text-xs align-top">°</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* 5-Day Forecast Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[#cfa94d] font-playfair text-base">5-DAY FORECAST</h2>
              <div className="text-[#888] text-xs">
                {selectedCity + 1}/{cities.length}
              </div>
            </div>
            
            {/* 5-Day Forecast */}
            <div className="relative">
              <div className="space-y-2 md:space-y-3 overflow-y-auto max-h-[calc(100vh-24rem)] md:max-h-[280px] pr-1 custom-scrollbar">
                {currentCity.tenDayForecast.length >= 5 ? (
                  // If we have 5 or more days, show exactly 5
                  currentCity.tenDayForecast.slice(0, 5).map((day: any, index: number) => (
                    <button 
                      key={index}
                      onClick={() => setSelectedDay(index)}
                      className="w-full flex items-center justify-between bg-black hover:bg-[#0f0f0f] transition-colors rounded-lg p-2 md:p-3 text-left"
                    >
                      <div className="w-1/4 md:w-1/3">
                        <div className="text-[#f2f0e6] font-medium">{day.day}</div>
                      </div>
                      
                      <div className="flex items-center justify-center w-1/3">
                        <WeatherIcon 
                          type={getWeatherIconType(day.description)} 
                          size="small"
                        />
                      </div>
                      
                      <div className="w-1/4 md:w-1/3 text-right">
                        <div className="text-[#b8923f] temperature flex items-center justify-end gap-2">
                          <span className="text-[#666] text-xs md:text-sm">{day.low}°</span>
                          <span className="text-[#f2f0e6] text-sm md:text-base">{day.high}°</span>
                        </div>
                        <div className="text-xs text-[#aaa]">
                          AQI: {day.airQuality.index} - {day.airQuality.description}
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  // If we have fewer than 5 days, generate additional days to make it 5
                  Array(5).fill(0).map((_, index) => {
                    // Use existing forecast data if available, otherwise generate mock data
                    const day = index < currentCity.tenDayForecast.length 
                      ? currentCity.tenDayForecast[index] 
                      : {
                          day: ["Today", "Tomorrow", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][index % 7],
                          high: Math.floor(Math.random() * 20) + 65,
                          low: Math.floor(Math.random() * 15) + 45,
                          description: weatherConditions[Math.floor(Math.random() * weatherConditions.length)],
                          airQuality: {
                            index: Math.floor(Math.random() * 150) + 30,
                            description: getAirQualityDescription(Math.floor(Math.random() * 150) + 30)
                          },
                          feelsLike: Math.floor(Math.random() * 10) + 60,
                          windSpeed: Math.floor(Math.random() * 20) + 5,
                          uvIndex: Math.floor(Math.random() * 10) + 1,
                          hourlyDetails: Array(24).fill(0).map((_, idx) => ({
                            hour: idx === 0 ? "12 AM" : idx === 12 ? "12 PM" : idx < 12 ? `${idx} AM` : `${idx - 12} PM`,
                            temp: Math.floor(Math.random() * 15) + 60,
                            rainChance: Math.floor(Math.random() * 100),
                            humidity: Math.floor(Math.random() * 40) + 40
                          }))
                        };
                    
                    return (
                      <button 
                        key={index}
                        onClick={() => setSelectedDay(index)}
                        className="w-full flex items-center justify-between bg-black hover:bg-[#0f0f0f] transition-colors rounded-lg p-2 md:p-3 text-left"
                      >
                        <div className="w-1/4 md:w-1/3">
                          <div className="text-[#f2f0e6] font-medium">{day.day}</div>
                        </div>
                        
                        <div className="flex items-center justify-center w-1/3">
                          <WeatherIcon 
                            type={getWeatherIconType(day.description)} 
                            size="small"
                          />
                        </div>
                        
                        <div className="w-1/4 md:w-1/3 text-right">
                          <div className="text-[#b8923f] temperature flex items-center justify-end gap-2">
                            <span className="text-[#666] text-xs md:text-sm">{day.low}°</span>
                            <span className="text-[#f2f0e6] text-sm md:text-base">{day.high}°</span>
                          </div>
                          <div className="text-xs text-[#aaa]">
                            AQI: {day.airQuality.index} - {day.airQuality.description}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;