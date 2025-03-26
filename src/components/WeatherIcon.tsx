import React from 'react';
import { WeatherIconProps } from '../types';

const WeatherIcon: React.FC<WeatherIconProps> = ({ type, className = '', size = 'large' }) => {
  // Size variants
  const iconSizes = {
    large: {
      container: 'w-[90px] h-[90px]',
    },
    small: {
      container: 'w-[25px] h-[25px]',
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

  return (
    <div className={`${className} flex items-center justify-center`}>
      <img 
        src={iconUrls[type as keyof typeof iconUrls]} 
        alt={`${type} weather`}
        className={`${iconSizes[size as 'large' | 'small'].container}`}
      />
      {/* Attribution for Icons8 */}
      {/* <a href="https://icons8.com/icon/set/weather/ios">Weather icons by Icons8</a> */}
    </div>
  );
}

export default WeatherIcon;