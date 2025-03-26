import React, { useState, useRef, TouchEvent, useEffect } from 'react';
import { MapPin, Plus, ChevronLeft, ChevronRight, X, AlertCircle } from 'lucide-react';
import WeatherIcon from './components/WeatherIcon';
import DayDetail from './components/DayDetail';
import { WeatherData } from './types';
import { fetchWeatherForCity, API_USAGE, getRemainingApiCalls, isNearApiLimit } from './api/tomorrowApiConfig';
import { weatherDataAgent } from './api/llmProcessor';

// Import the mock data for initial loading or fallback
import { weatherData, parisWeather, newYorkWeather, miamiWeather, denverWeather, chicagoWeather, sanFranciscoWeather } from './data';

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

  // Handler for adding a new city
  const addCity = async (cityName: string, temp: number = 70) => {
    // Check if we've reached the maximum number of cities (5)
    if (cities.length >= 5) {
      setError("Maximum limit of 5 cities reached. Please remove a city before adding a new one.");
      return;
    }
    
    // Check if the city is already in the list
    const existingCityIndex = cities.findIndex(city => city.city.toLowerCase() === cityName.toLowerCase());
    if (existingCityIndex >= 0) {
      setSelectedCity(existingCityIndex);
      setShowCityDropdown(false);
      return;
    }
    
    // Show loading state
    setLoading(true);
    
    try {
      // Fetch city data (will use mock data if API limit reached)
      const cityData = await fetchCityData(cityName);
      
      // Add the new city to the list
      setCities([...cities, cityData]);
      setSelectedCity(cities.length); // Select the newly added city
    } catch (err: any) {
      console.error(`Error adding city ${cityName}:`, err);
      
      // This should rarely happen now that fetchCityData handles errors
      setError(`Failed to add ${cityName}. Using placeholder data.`);
      
      // Create a placeholder using the helper function
      const fallbackData = getMockDataForCity(cityName);
      
      // Add the fallback data
      setCities([...cities, fallbackData]);
      setSelectedCity(cities.length);
    } finally {
      setLoading(false);
      setShowCityDropdown(false);
      setCustomCityName(''); // Reset custom city input
    }
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
  const determineRimColor = (description: string): { color: string, oscillate: boolean } => {
    const lowerDesc = description.toLowerCase();
    
    if (lowerDesc.includes('sunny') || lowerDesc.includes('clear')) {
      return { color: '#CFA94D', oscillate: false }; // Gold for sunny
    } else if (lowerDesc.includes('partly cloudy')) {
      return { color: '#CFA94D', oscillate: true }; // Oscillate between gold and gray
    } else if (lowerDesc.includes('cloudy')) {
      return { color: '#888888', oscillate: false }; // Gray for cloudy
    } else if (lowerDesc.includes('rain')) {
      return { color: '#4682B4', oscillate: false }; // Steel blue for rainy
    } else {
      return { color: '#CFA94D', oscillate: false }; // Default gold
    }
  };

  // Effect to update rim color when city or day changes
  useEffect(() => {
    if (cities.length === 0 || selectedCity >= cities.length) return;
    
    const currentDescription = selectedDay !== null 
      ? cities[selectedCity].tenDayForecast[selectedDay].description || cities[selectedCity].description
      : cities[selectedCity].description;
    
    const { color, oscillate } = determineRimColor(currentDescription);
    setRimColor(color);
    setIsOscillating(oscillate);
  }, [selectedCity, selectedDay, cities]);

  // Effect to handle oscillation if needed
  useEffect(() => {
    if (!isOscillating) return;
    
    let colorToggle = false;
    const oscillationInterval = setInterval(() => {
      colorToggle = !colorToggle;
      setRimColor(colorToggle ? '#CFA94D' : '#888888'); // Toggle between gold and gray
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
    <div className="min-h-screen bg-[#111] flex items-center justify-center p-4">
      <div 
        className={`w-[350px] min-h-[667px] bg-[#000] rounded-[30px] overflow-hidden relative shadow-2xl shadow-black/60 ${isOscillating ? 'oscillating-rim' : ''}`}
        style={isOscillating ? {} : rimStyle}
      >
        {selectedDay !== null ? (
          <DayDetail 
            day={currentCity.tenDayForecast[selectedDay]} 
            onClose={() => setSelectedDay(null)} 
          />
        ) : (
          <div className="p-8">
            {/* Swipeable Area */}
            <div
              ref={swipeableRef}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              className="mb-6"
            >
              {/* API Usage Indicator */}
              {isNearApiLimit() && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-[#333] px-2 py-1 rounded-full flex items-center gap-1 z-10">
                  <AlertCircle size={12} className={apiCallsRemaining <= 2 ? 'text-red-500' : 'text-amber-500'} />
                  <span className="text-xs text-white">API: {apiCallsRemaining} calls left</span>
                </div>
              )}
              
              {/* City Selector with Remove Option */}
              <div className="flex flex-col items-center mb-8">
                {/* Add city button moved to the right corner absolutely positioned */}
                <button
                  onClick={() => setShowCityDropdown(true)}
                  className="absolute top-8 right-8 text-[#cfa94d] hover:text-[#b8923f] transition-colors p-2"
                  aria-label="Add city"
                >
                  <Plus size={24} />
                </button>
                
                {/* Refresh Button - Moved to top left */}
                <button
                  onClick={() => refreshCityData(selectedCity)}
                  disabled={loading}
                  className="absolute top-8 left-8 w-10 h-10 rounded-full bg-[#cfa94d] flex items-center justify-center text-black"
                  aria-label="Refresh weather data"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 2v6h-6"></path>
                      <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                      <path d="M3 22v-6h6"></path>
                      <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
                    </svg>
                  )}
                </button>
                
                {/* Centered page indicator dots */}
                <div className="flex gap-4 justify-center">
                  {cities.map((_, index) => (
                    <div key={index} className="relative group">
                      <button
                        onClick={() => setSelectedCity(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          selectedCity === index ? 'bg-[#cfa94d]' : 'bg-[#333]'
                        }`}
                        aria-label={`City ${index + 1}${selectedCity === index ? ' (current)' : ''}`}
                      />
                      {cities.length > 1 && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            removeCity(index);
                          }}
                          className="absolute -top-2 -right-2 w-4 h-4 bg-[#333] rounded-full flex items-center justify-center text-[#cfa94d] opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label={`Remove city ${index + 1}`}
                        >
                          <X size={8} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* City Dropdown */}
              {showCityDropdown && (
                <div className="absolute top-0 left-0 w-full h-full bg-black/90 z-10 flex items-center justify-center p-6">
                  <div className="bg-[#111] w-full max-w-[280px] rounded-2xl p-4 border border-[#222]" style={{ borderColor: rimColor }}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-playfair" style={{ color: rimColor }}>Select a City</h3>
                      <button 
                        onClick={() => setShowCityDropdown(false)}
                        className="text-[#cfa94d] hover:text-[#b8923f]"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    
                    {/* Custom City Input */}
                    <form onSubmit={handleCustomCitySubmit} className="mb-4">
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
                    
                    <div className="space-y-1 max-h-[200px] overflow-y-auto">
                      {availableCities.map((city, index) => (
                        <button
                          key={index}
                          className={`w-full text-left px-3 py-2 rounded transition-colors flex justify-between items-center ${
                            cities.length >= 5 
                              ? 'opacity-50 cursor-not-allowed bg-[#1a1a1a]' 
                              : 'hover:bg-[#222]'
                          }`}
                          onClick={() => cities.length < 5 && addCity(city.name, city.temp)}
                          disabled={cities.length >= 5}
                        >
                          <span className="text-[#f2f0e6]">{city.name}</span>
                          <span className="text-[#b8923f] temperature">{city.temp}°</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Top Section */}
              <div className="text-center relative">
                {cities.length > 1 && (
                  <>
                    {selectedCity > 0 && (
                      <button 
                        onClick={() => setSelectedCity(prev => prev - 1)}
                        className="absolute left-0 top-1/2 -translate-y-1/2 text-[#cfa94d] hover:text-[#b8923f] transition-colors"
                        aria-label="Previous city"
                      >
                        <ChevronLeft size={24} />
                      </button>
                    )}
                    {selectedCity < cities.length - 1 && (
                      <button 
                        onClick={() => setSelectedCity(prev => prev + 1)}
                        className="absolute right-0 top-1/2 -translate-y-1/2 text-[#cfa94d] hover:text-[#b8923f] transition-colors"
                        aria-label="Next city"
                      >
                        <ChevronRight size={24} />
                      </button>
                    )}
                  </>
                )}
                
                {/* Loading State */}
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
                    <div className="w-8 h-8 border-4 border-[#cfa94d] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                
                {/* Error Message */}
                {error && (
                  <div className="absolute bottom-0 left-0 right-0 bg-red-900/80 text-white text-xs p-2 rounded-b-xl">
                    {error}
                    <button 
                      className="ml-2 text-white/80 hover:text-white"
                      onClick={() => setError(null)}
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}

                <div className="mb-8">
                  <div className="flex items-center justify-center mb-1">
                    <MapPin size={16} className="text-[#cfa94d] mr-1" />
                    <h2 className="text-[#f2f0e6] font-playfair text-lg">{currentCity.city}</h2>
                  </div>
                  <p className="text-[#888]">{currentCity.description}</p>
                </div>

                <div className="mb-8 flex items-center justify-center">
                  <div className="mr-4">
                    <WeatherIcon type={getWeatherIconType(currentCity.description)} size="large" />
                  </div>
                  <div className="text-[#f2f0e6] temperature text-7xl font-playfair">{currentCity.temperature}°</div>
                </div>
                
                {/* Weather Insights - Display LLM-generated summary if available */}
                {currentCity.weatherInsights && (
                  <div className="mb-6 text-center">
                    <p className="text-[#b8923f] text-sm italic">{currentCity.weatherInsights}</p>
                  </div>
                )}

                <div className="grid grid-cols-5 gap-2 mb-8">
                  {currentCity.hourlyForecast.map((hour: {
                    hour: string;
                    temp: number;
                    description?: string;
                  }, index: number) => (
                    <div key={index} className="text-center">
                      <div className="text-[#888] text-xs mb-1">{hour.hour}</div>
                      <div className="flex justify-center mb-1">
                        <WeatherIcon type={getWeatherIconType(hour.description)} size="small" />
                      </div>
                      <div className="text-[#f2f0e6] temperature text-sm">{hour.temp}°</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 5-Day Forecast */}
            <div>
              <h3 className="text-[#cfa94d] text-xs uppercase tracking-widest mb-3">5-Day Forecast</h3>
              <div className="space-y-4">
                {currentCity.tenDayForecast.slice(0, 5).map((day: {
                  day: string;
                  high: number;
                  low: number;
                  description?: string;
                  insight?: string;
                  airQuality: {
                    index: number;
                    description: string;
                  };
                  hourlyDetails: {
                    hour: string;
                    temp: number;
                    rainChance: number;
                    humidity: number;
                  }[];
                  feelsLike: number;
                  windSpeed: number;
                  uvIndex: number;
                }, index: number) => (
                  <button
                    key={index}
                    className="w-full flex items-center justify-between hover:bg-[#111] p-1 rounded transition-colors"
                    onClick={() => setSelectedDay(index)}
                  >
                    <div className="text-[#f2f0e6] font-medium text-left w-24">{day.day}</div>
                    <div className="flex justify-center w-10">
                      <WeatherIcon type={getWeatherIconType(day.description)} size="small" />
                    </div>
                    
                    {/* Show LLM-generated insight if available */}
                    {day.insight ? (
                      <div className="text-[#888] text-xs text-left flex-1 mx-2 truncate">
                        {day.insight}
                      </div>
                    ) : (
                      <div className="text-[#888] text-xs text-left flex-1 mx-2">
                        AQI: {day.airQuality.index} - {day.airQuality.description}
                      </div>
                    )}
                    
                    <div className="flex space-x-3 text-right">
                      <span className="text-[#888] temperature">{day.low}°</span>
                      <span className="text-[#f2f0e6] temperature">{day.high}°</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;