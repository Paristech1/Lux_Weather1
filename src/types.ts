export interface WeatherData {
  city: string;
  fullLocationName?: string; // Added to store the full location details
  temperature: number;
  description: string;
  weatherInsights?: string; // Added for LLM-generated weather insights
  hourlyForecast: {
    hour: string;
    temp: number;
    description?: string;
  }[];
  tenDayForecast: {
    day: string;
    high: number;
    low: number;
    description?: string;
    insight?: string; // Added for LLM-generated day-specific insights
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
  // Additional properties used in the app
  humidity?: number;
  windSpeed?: number;
  precipitation?: number;
  uvIndex?: number;
  airQuality?: {
    index: number;
    description: string;
  };
  sunrise?: string;
  sunset?: string;
}

export interface WeatherIconProps {
  type: 'sunny' | 'cloudy' | 'rainy' | 'partly-cloudy' | 'thunderstorm' | 'snow' | 'foggy' | 'windy';
  className?: string;
  size?: 'large' | 'small';
} 