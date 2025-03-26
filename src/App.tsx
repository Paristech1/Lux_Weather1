import React, { useState, useRef, TouchEvent, useEffect } from 'react';
import { weatherData, parisWeather, newYorkWeather, miamiWeather, denverWeather, chicagoWeather, sanFranciscoWeather } from './data';
import WeatherIcon from './components/WeatherIcon';
import DayDetail from './components/DayDetail';
import { MapPin, Plus, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { WeatherData } from './types';

function App() {
  const [cities, setCities] = useState<WeatherData[]>([
    parisWeather,
    newYorkWeather,
    miamiWeather,
    denverWeather,
    chicagoWeather,
    sanFranciscoWeather
  ]);
  const [selectedCity, setSelectedCity] = useState<number>(0);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const swipeableRef = useRef<HTMLDivElement>(null);
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

  const addCity = (cityName: string, temp: number) => {
    let newCity: WeatherData;
    
    // Use existing weather data if available
    if (cityName === "New York") {
      newCity = newYorkWeather;
    } else if (cityName === "Miami") {
      newCity = miamiWeather;
    } else if (cityName === "Denver") {
      newCity = denverWeather;
    } else if (cityName === "Chicago") {
      newCity = chicagoWeather;
    } else if (cityName === "San Francisco") {
      newCity = sanFranciscoWeather;
    } else {
      // Fallback to creating a new city with the same structure as Paris
      newCity = {
        ...parisWeather,
        city: cityName,
        temperature: temp,
      };
    }
    
    // Check if the city is already in the list
    const existingCityIndex = cities.findIndex(city => city.city === cityName);
    if (existingCityIndex >= 0) {
      setSelectedCity(existingCityIndex);
    } else {
      setCities([...cities, newCity]);
      setSelectedCity(cities.length);
    }
    
    setShowCityDropdown(false);
  };

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

  const currentCity = cities[selectedCity];

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
              {/* City Selector */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                  <div className="flex gap-4">
                    {cities.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedCity(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          selectedCity === index ? 'bg-[#cfa94d]' : 'bg-[#333]'
                        }`}
                        aria-label={`City ${index + 1}${selectedCity === index ? ' (current)' : ''}`}
                      />
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => setShowCityDropdown(true)}
                  className="text-[#cfa94d] hover:text-[#b8923f] transition-colors p-2"
                  aria-label="Add city"
                >
                  <Plus size={24} />
                </button>
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
                    <div className="space-y-1 max-h-[240px] overflow-y-auto">
                      {availableCities.map((city, index) => (
                        <button
                          key={index}
                          className="w-full text-left px-3 py-2 hover:bg-[#222] rounded transition-colors flex justify-between items-center"
                          onClick={() => addCity(city.name, city.temp)}
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
                <WeatherIcon 
                  type={
                    currentCity.description.toLowerCase().includes('cloudy') 
                      ? currentCity.description.toLowerCase().includes('partly') 
                        ? 'partly-cloudy' 
                        : 'cloudy'
                      : currentCity.description.toLowerCase().includes('rain')
                        ? 'rainy'
                        : currentCity.description.toLowerCase().includes('snow')
                          ? 'snow'
                          : currentCity.description.toLowerCase().includes('thunder')
                            ? 'thunderstorm'
                            : currentCity.description.toLowerCase().includes('fog')
                              ? 'foggy'
                              : currentCity.description.toLowerCase().includes('wind')
                                ? 'windy'
                                : 'sunny'
                  } 
                  className="mx-auto mb-6" 
                />
                <div className="text-7xl font-extralight text-[#f2f0e6] mb-4 temperature">
                  {currentCity.temperature}°
                </div>
                <div className="flex items-center justify-center gap-1 text-xl text-[#cfa94d] mb-2">
                  <MapPin size={18} />
                  <span className="font-playfair">{currentCity.city}</span>
                </div>
                <div className="text-lg capitalize" style={{ color: rimColor }}>
                  {currentCity.description}
                </div>
              </div>
            </div>

            <div className="w-[98%] h-[1px] mx-auto my-6 bg-gradient-to-r from-transparent to-transparent" style={{ backgroundImage: `linear-gradient(to right, transparent, ${rimColor}, transparent)`, opacity: 0.7 }} />

            {/* Hourly Forecast */}
            <div className="mb-6">
              <h2 className="text-lg font-playfair mb-3" style={{ color: rimColor }}>Hourly Forecast</h2>
              <div className="flex justify-between">
                {currentCity.hourlyForecast.map((hour, index) => (
                  <div key={index} className="text-center w-12">
                    <div className="text-sm text-[#aaa] mb-1">{hour.hour}</div>
                    <WeatherIcon 
                      type={
                        hour.description?.toLowerCase().includes('cloudy')
                          ? hour.description.toLowerCase().includes('partly')
                            ? 'partly-cloudy'
                            : 'cloudy'
                          : hour.description?.toLowerCase().includes('rain')
                            ? 'rainy'
                            : 'sunny'
                      }
                      className="mx-auto mb-1" 
                      size="small" 
                    />
                    <div className="text-[#b8923f] w-full text-center temperature">{hour.temp}°</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-[98%] h-[1px] mx-auto my-6 bg-gradient-to-r from-transparent to-transparent" style={{ backgroundImage: `linear-gradient(to right, transparent, ${rimColor}, transparent)`, opacity: 0.7 }} />

            {/* 10-Day Forecast */}
            <div>
              <h2 className="text-lg font-playfair mb-3" style={{ color: rimColor }}>10-Day Forecast</h2>
              <div className="space-y-2">
                {currentCity.tenDayForecast.map((day, index) => (
                  <button
                    key={index}
                    className="w-full flex justify-between items-center py-2 border-b border-[#333]/30 last:border-0 hover:bg-[#222]/30 transition-colors rounded px-2"
                    onClick={() => setSelectedDay(index)}
                  >
                    <div className="text-[#f2f0e6] w-24 text-left">{day.day}</div>
                    <div className="flex items-center flex-grow justify-center">
                      <WeatherIcon
                        type={
                          day.description?.toLowerCase().includes('cloudy')
                            ? day.description.toLowerCase().includes('partly')
                              ? 'partly-cloudy'
                              : 'cloudy'
                            : day.description?.toLowerCase().includes('rain')
                              ? 'rainy'
                              : 'sunny'
                        }
                        className="mr-2"
                        size="small"
                      />
                    </div>
                    <div className="text-[#b8923f] w-20 text-right temperature">
                      {day.high}° / {day.low}°
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