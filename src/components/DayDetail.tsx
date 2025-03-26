import React from 'react';
import { Wind, Droplets, Sun, ArrowLeft, Lightbulb } from 'lucide-react';
import WeatherIcon from './WeatherIcon';

interface DayDetailProps {
  day: any;
  onClose: () => void;
}

const DayDetail: React.FC<DayDetailProps> = ({ day, onClose }) => {
  // More comprehensive mapping of weather descriptions to icon types
  const getWeatherIconType = (description: string = ''): 'sunny' | 'cloudy' | 'rainy' | 'partly-cloudy' | 'thunderstorm' | 'snow' | 'foggy' | 'windy' => {
    const desc = description.toLowerCase();
    
    if (desc === 'sunny' || desc === 'clear') return 'sunny';
    if (desc === 'partly-cloudy' || desc.includes('partly')) return 'partly-cloudy';
    if (desc === 'cloudy' || desc.includes('cloud')) return 'cloudy';
    if (desc === 'rainy' || desc.includes('rain') || desc.includes('drizzle')) return 'rainy';
    if (desc === 'thunderstorm' || desc.includes('thunder') || desc.includes('storm')) return 'thunderstorm';
    if (desc === 'snow' || desc.includes('snow') || desc.includes('ice') || desc.includes('sleet')) return 'snow';
    if (desc === 'foggy' || desc.includes('fog') || desc.includes('mist')) return 'foggy';
    if (desc === 'windy' || desc.includes('wind')) return 'windy';
    
    // Default to partly-cloudy as a safe fallback
    return 'partly-cloudy';
  };

  return (
    <div className="absolute inset-0 bg-[#000] p-8 animate-fade-in">
      <button 
        onClick={onClose}
        className="text-[#cfa94d] hover:text-[#b8923f] transition-colors mb-6 flex items-center gap-2"
      >
        <ArrowLeft size={20} />
        <span>Back to forecast</span>
      </button>

      <div className="text-center mb-8">
        <WeatherIcon type={getWeatherIconType(day.description)} className="mx-auto mb-4" />
        <div className="text-2xl text-[#cfa94d] mb-2 font-playfair">{day.day}</div>
        <div className="text-6xl font-extralight text-[#f2f0e6] mb-2 temperature">
          {day.high}° <span className="text-2xl text-[#b8923f]">/ {day.low}°</span>
        </div>
        
        {/* Display AI-generated insight if available */}
        {day.insight && (
          <div className="flex items-center justify-center mt-4 mb-2 text-[#b8923f]">
            <Lightbulb size={16} className="mr-2" />
            <p className="text-sm italic">{day.insight}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="text-center">
          <Wind className="text-[#cfa94d] mx-auto mb-2" size={24} />
          <div className="text-sm text-[#aaa]">Wind</div>
          <div className="text-[#b8923f] h-6 flex items-center justify-center temperature">{day.windSpeed} mph</div>
        </div>
        <div className="text-center">
          <Droplets className="text-[#cfa94d] mx-auto mb-2" size={24} />
          <div className="text-sm text-[#aaa]">Humidity</div>
          <div className="text-[#b8923f] h-6 flex items-center justify-center temperature">{day.hourlyDetails[0].humidity}%</div>
        </div>
        <div className="text-center">
          <Sun className="text-[#cfa94d] mx-auto mb-2" size={24} />
          <div className="text-sm text-[#aaa]">UV Index</div>
          <div className="text-[#b8923f] h-6 flex items-center justify-center temperature">{day.uvIndex}</div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg text-[#cfa94d] mb-4">Hourly Forecast</h3>
        <div className="space-y-3">
          {day.hourlyDetails.map((hour: any, index: number) => (
            <div key={index} className="flex items-center justify-between bg-[#222]/50 rounded-lg p-3">
              <div className="text-[#f2f0e6] w-16">{hour.hour}</div>
              <div className="text-[#b8923f] w-12 text-center temperature">{hour.temp}°</div>
              <div className="text-[#9c7f35] w-12 text-right temperature">{hour.rainChance}%</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg text-[#cfa94d] mb-2">Air Quality</h3>
        <div className="bg-[#222]/50 rounded-lg p-4">
          <div className="text-2xl text-[#b8923f] mb-1 temperature">{day.airQuality.index}</div>
          <div className="text-[#f2f0e6]">{day.airQuality.description}</div>
        </div>
      </div>
    </div>
  );
}

export default DayDetail