import React from 'react';
import { Sun, Cloud, CloudRain, CloudSun } from 'lucide-react';
import { WeatherIconProps } from '../types';

const WeatherIcon: React.FC<WeatherIconProps> = ({ type, className = '' }) => {
  const iconMap = {
    'sunny': <Sun className="text-[#cfa94d]" size={80} />,
    'cloudy': <Cloud className="text-[#aaa]" size={80} />,
    'rainy': <CloudRain className="text-[#9c7f35]" size={80} />,
    'partly-cloudy': <CloudSun className="text-[#b8923f]" size={80} />,
  };

  return (
    <div className={`relative ${className}`}>
      {iconMap[type]}
    </div>
  );
}

export default WeatherIcon;