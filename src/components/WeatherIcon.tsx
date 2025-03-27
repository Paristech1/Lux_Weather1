import React from 'react';
import { WeatherIconProps } from '../types';

const WeatherIcon: React.FC<WeatherIconProps> = ({ type, className = '', size = 'large' }) => {
  // Size variants with responsive breakpoints
  const iconSizes = {
    large: {
      container: 'w-[70px] h-[70px] sm:w-[80px] sm:h-[80px] md:w-[90px] md:h-[90px]',
    },
    small: {
      container: 'w-[20px] h-[20px] sm:w-[22px] sm:h-[22px] md:w-[25px] md:h-[25px]',
    }
  };

  // Colors based on the app's gold palette
  const colors = {
    primary: '#CFA94D',
    secondary: '#EACD76',
    dark: '#9C7F35',
    cloud: '#FFFFFF',
    rainBlue: '#4682B4',
  };

  // Icon URLs from Icons8 iOS style weather icons
  const iconUrls = {
    'sunny': 'https://img.icons8.com/ios/100/CFA94D/sun--v1.png',
    'partly-cloudy': 'https://img.icons8.com/ios/100/CFA94D/partly-cloudy-day--v1.png',
    'cloudy': 'https://img.icons8.com/ios/100/FFFFFF/clouds--v1.png',
    'rainy': 'https://img.icons8.com/ios/100/FFFFFF/rain--v1.png',
    'thunderstorm': 'https://img.icons8.com/ios/100/FFFFFF/storm--v1.png',
    'snow': 'https://img.icons8.com/ios/100/FFFFFF/snow--v1.png',
    'foggy': 'https://img.icons8.com/ios/100/FFFFFF/fog-day--v1.png',
    'windy': 'https://img.icons8.com/ios/100/CFA94D/wind--v1.png'
  };

  // Fallback in case icon URL fails to load
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // If the image fails to load, use a fallback SVG for the respective weather type
    const target = e.target as HTMLImageElement;
    target.style.opacity = '0.8'; // Slightly reduce opacity to indicate fallback

    // Simple inline SVG fallbacks
    if (type === 'sunny') {
      target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%23CFA94D' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='5'%3E%3C/circle%3E%3Cline x1='12' y1='1' x2='12' y2='3'%3E%3C/line%3E%3Cline x1='12' y1='21' x2='12' y2='23'%3E%3C/line%3E%3Cline x1='4.22' y1='4.22' x2='5.64' y2='5.64'%3E%3C/line%3E%3Cline x1='18.36' y1='18.36' x2='19.78' y2='19.78'%3E%3C/line%3E%3Cline x1='1' y1='12' x2='3' y2='12'%3E%3C/line%3E%3Cline x1='21' y1='12' x2='23' y2='12'%3E%3C/line%3E%3Cline x1='4.22' y1='19.78' x2='5.64' y2='18.36'%3E%3C/line%3E%3Cline x1='18.36' y1='5.64' x2='19.78' y2='4.22'%3E%3C/line%3E%3C/svg%3E";
    } else {
      // Default fallback for any other type
      target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%23FFFFFF' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z'%3E%3C/path%3E%3C/svg%3E";
    }
  };

  return (
    <div className={`${className} flex items-center justify-center`}>
      <img 
        src={iconUrls[type as keyof typeof iconUrls]} 
        alt={`${type} weather`}
        className={`${iconSizes[size as 'large' | 'small'].container} object-contain`}
        onError={handleImageError}
        loading="lazy" // Add lazy loading for better performance
      />
      {/* Attribution for Icons8 */}
      {/* <a href="https://icons8.com/icon/set/weather/ios">Weather icons by Icons8</a> */}
    </div>
  );
}

export default WeatherIcon;