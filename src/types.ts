export interface WeatherData {
  city: string;
  temperature: number;
  description: string;
  hourlyForecast: {
    hour: string;
    temp: number;
  }[];
  tenDayForecast: {
    day: string;
    high: number;
    low: number;
    description?: string;
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
  }[];
}

export interface WeatherIconProps {
  type: 'sunny' | 'cloudy' | 'rainy' | 'partly-cloudy';
  className?: string;
}