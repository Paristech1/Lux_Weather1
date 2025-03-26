import { WeatherData } from './types';

export const weatherData: WeatherData = {
  city: 'Paris',
  temperature: 72,
  description: 'Sunny',
  hourlyForecast: [
    { hour: '10 AM', temp: 73 },
    { hour: '11 AM', temp: 75 },
    { hour: '12 PM', temp: 77 },
    { hour: '1 PM', temp: 79 },
    { hour: '2 PM', temp: 81 },
  ],
  tenDayForecast: [
    {
      day: 'Tuesday',
      high: 77,
      low: 58,
      description: 'Sunny',
      airQuality: { index: 32, description: 'Good' },
      hourlyDetails: [
        { hour: '6 AM', temp: 58, rainChance: 0, humidity: 65 },
        { hour: '9 AM', temp: 65, rainChance: 0, humidity: 60 },
        { hour: '12 PM', temp: 73, rainChance: 0, humidity: 55 },
        { hour: '3 PM', temp: 77, rainChance: 0, humidity: 50 },
        { hour: '6 PM', temp: 72, rainChance: 0, humidity: 55 },
        { hour: '9 PM', temp: 65, rainChance: 0, humidity: 60 },
      ],
      feelsLike: 75,
      windSpeed: 8,
      uvIndex: 6
    },
    {
      day: 'Wednesday',
      high: 79,
      low: 61,
      description: 'Partly Cloudy',
      airQuality: { index: 45, description: 'Good' },
      hourlyDetails: [
        { hour: '6 AM', temp: 61, rainChance: 10, humidity: 70 },
        { hour: '9 AM', temp: 68, rainChance: 20, humidity: 65 },
        { hour: '12 PM', temp: 75, rainChance: 30, humidity: 60 },
        { hour: '3 PM', temp: 79, rainChance: 20, humidity: 55 },
        { hour: '6 PM', temp: 74, rainChance: 10, humidity: 60 },
        { hour: '9 PM', temp: 67, rainChance: 5, humidity: 65 },
      ],
      feelsLike: 77,
      windSpeed: 10,
      uvIndex: 7
    },
    // ... Add similar detailed data for other days
    {
      day: 'Thursday',
      high: 81,
      low: 60,
      description: 'Sunny',
      airQuality: { index: 38, description: 'Good' },
      hourlyDetails: [
        { hour: '6 AM', temp: 60, rainChance: 5, humidity: 68 },
        { hour: '9 AM', temp: 69, rainChance: 10, humidity: 63 },
        { hour: '12 PM', temp: 77, rainChance: 15, humidity: 58 },
        { hour: '3 PM', temp: 81, rainChance: 10, humidity: 53 },
        { hour: '6 PM', temp: 75, rainChance: 5, humidity: 58 },
        { hour: '9 PM', temp: 68, rainChance: 0, humidity: 63 },
      ],
      feelsLike: 79,
      windSpeed: 9,
      uvIndex: 8
    },
    {
      day: 'Friday',
      high: 78,
      low: 59,
      description: 'Cloudy',
      airQuality: { index: 35, description: 'Good' },
      hourlyDetails: Array(6).fill(null).map((_, i) => ({
        hour: `${6 + (i * 3)} ${i < 2 ? 'AM' : 'PM'}`,
        temp: Math.floor(59 + (Math.random() * 19)),
        rainChance: Math.floor(Math.random() * 30),
        humidity: Math.floor(50 + (Math.random() * 20))
      })),
      feelsLike: 76,
      windSpeed: 7,
      uvIndex: 6
    },
    {
      day: 'Saturday',
      high: 76,
      low: 55,
      description: 'Rainy',
      airQuality: { index: 30, description: 'Good' },
      hourlyDetails: Array(6).fill(null).map((_, i) => ({
        hour: `${6 + (i * 3)} ${i < 2 ? 'AM' : 'PM'}`,
        temp: Math.floor(55 + (Math.random() * 21)),
        rainChance: Math.floor(Math.random() * 30),
        humidity: Math.floor(50 + (Math.random() * 20))
      })),
      feelsLike: 74,
      windSpeed: 6,
      uvIndex: 5
    },
    {
      day: 'Sunday',
      high: 80,
      low: 62,
      description: 'Partly Cloudy',
      airQuality: { index: 42, description: 'Good' },
      hourlyDetails: Array(6).fill(null).map((_, i) => ({
        hour: `${6 + (i * 3)} ${i < 2 ? 'AM' : 'PM'}`,
        temp: Math.floor(62 + (Math.random() * 18)),
        rainChance: Math.floor(Math.random() * 30),
        humidity: Math.floor(50 + (Math.random() * 20))
      })),
      feelsLike: 78,
      windSpeed: 8,
      uvIndex: 7
    },
    {
      day: 'Monday',
      high: 81,
      low: 63,
      description: 'Sunny',
      airQuality: { index: 40, description: 'Good' },
      hourlyDetails: Array(6).fill(null).map((_, i) => ({
        hour: `${6 + (i * 3)} ${i < 2 ? 'AM' : 'PM'}`,
        temp: Math.floor(63 + (Math.random() * 18)),
        rainChance: Math.floor(Math.random() * 30),
        humidity: Math.floor(50 + (Math.random() * 20))
      })),
      feelsLike: 79,
      windSpeed: 9,
      uvIndex: 8
    },
    {
      day: 'Tuesday',
      high: 83,
      low: 64,
      description: 'Sunny',
      airQuality: { index: 45, description: 'Good' },
      hourlyDetails: Array(6).fill(null).map((_, i) => ({
        hour: `${6 + (i * 3)} ${i < 2 ? 'AM' : 'PM'}`,
        temp: Math.floor(64 + (Math.random() * 19)),
        rainChance: Math.floor(Math.random() * 30),
        humidity: Math.floor(50 + (Math.random() * 20))
      })),
      feelsLike: 81,
      windSpeed: 10,
      uvIndex: 9
    },
    {
      day: 'Wednesday',
      high: 82,
      low: 60,
      description: 'Cloudy',
      airQuality: { index: 38, description: 'Good' },
      hourlyDetails: Array(6).fill(null).map((_, i) => ({
        hour: `${6 + (i * 3)} ${i < 2 ? 'AM' : 'PM'}`,
        temp: Math.floor(60 + (Math.random() * 22)),
        rainChance: Math.floor(Math.random() * 30),
        humidity: Math.floor(50 + (Math.random() * 20))
      })),
      feelsLike: 80,
      windSpeed: 8,
      uvIndex: 7
    },
    {
      day: 'Thursday',
      high: 84,
      low: 65,
      description: 'Partly Cloudy',
      airQuality: { index: 41, description: 'Good' },
      hourlyDetails: Array(6).fill(null).map((_, i) => ({
        hour: `${6 + (i * 3)} ${i < 2 ? 'AM' : 'PM'}`,
        temp: Math.floor(65 + (Math.random() * 19)),
        rainChance: Math.floor(Math.random() * 30),
        humidity: Math.floor(50 + (Math.random() * 20))
      })),
      feelsLike: 82,
      windSpeed: 9,
      uvIndex: 8
    }
  ],
};