import { WeatherData } from './types';

// Paris with partly cloudy weather
export const parisWeather: WeatherData = {
  city: 'Paris',
  temperature: 72,
  description: 'Sunny',
  hourlyForecast: [
    { hour: '10 AM', temp: 73, description: 'Sunny' },
    { hour: '11 AM', temp: 75, description: 'Sunny' },
    { hour: '12 PM', temp: 77, description: 'Sunny' },
    { hour: '1 PM', temp: 79, description: 'Sunny' },
    { hour: '2 PM', temp: 81, description: 'Partly Cloudy' },
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
    {
      day: 'Thursday',
      high: 81,
      low: 60,
      description: 'Rainy',
      airQuality: { index: 38, description: 'Good' },
      hourlyDetails: [
        { hour: '6 AM', temp: 60, rainChance: 65, humidity: 88 },
        { hour: '9 AM', temp: 69, rainChance: 70, humidity: 83 },
        { hour: '12 PM', temp: 77, rainChance: 75, humidity: 78 },
        { hour: '3 PM', temp: 81, rainChance: 80, humidity: 73 },
        { hour: '6 PM', temp: 75, rainChance: 75, humidity: 78 },
        { hour: '9 PM', temp: 68, rainChance: 60, humidity: 83 },
      ],
      feelsLike: 79,
      windSpeed: 9,
      uvIndex: 3
    },
    // Additional days with more variety...
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
      description: 'Thunderstorm',
      airQuality: { index: 30, description: 'Good' },
      hourlyDetails: Array(6).fill(null).map((_, i) => ({
        hour: `${6 + (i * 3)} ${i < 2 ? 'AM' : 'PM'}`,
        temp: Math.floor(55 + (Math.random() * 21)),
        rainChance: Math.floor(50 + (Math.random() * 50)),
        humidity: Math.floor(70 + (Math.random() * 30))
      })),
      feelsLike: 74,
      windSpeed: 12,
      uvIndex: 2
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
      description: 'Windy',
      airQuality: { index: 45, description: 'Good' },
      hourlyDetails: Array(6).fill(null).map((_, i) => ({
        hour: `${6 + (i * 3)} ${i < 2 ? 'AM' : 'PM'}`,
        temp: Math.floor(64 + (Math.random() * 19)),
        rainChance: Math.floor(60 + (Math.random() * 40)),
        humidity: Math.floor(70 + (Math.random() * 30))
      })),
      feelsLike: 81,
      windSpeed: 25,
      uvIndex: 4
    },
    {
      day: 'Wednesday',
      high: 82,
      low: 60,
      description: 'Foggy',
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
      description: 'Snow',
      airQuality: { index: 41, description: 'Good' },
      hourlyDetails: Array(6).fill(null).map((_, i) => ({
        hour: `${6 + (i * 3)} ${i < 2 ? 'AM' : 'PM'}`,
        temp: Math.floor(30 + (Math.random() * 10)),
        rainChance: Math.floor(Math.random() * 30),
        humidity: Math.floor(50 + (Math.random() * 20))
      })),
      feelsLike: 82,
      windSpeed: 9,
      uvIndex: 8
    }
  ],
};

// New York with rainy weather
export const newYorkWeather: WeatherData = {
  city: 'New York',
  temperature: 58,
  description: 'Rainy',
  hourlyForecast: [
    { hour: '10 AM', temp: 55, description: 'Rainy' },
    { hour: '11 AM', temp: 56, description: 'Rainy' },
    { hour: '12 PM', temp: 57, description: 'Rainy' },
    { hour: '1 PM', temp: 58, description: 'Cloudy' },
    { hour: '2 PM', temp: 59, description: 'Cloudy' },
  ],
  tenDayForecast: [
    {
      day: 'Tuesday',
      high: 59,
      low: 48,
      description: 'Rainy',
      airQuality: { index: 38, description: 'Good' },
      hourlyDetails: Array(6).fill(null).map((_, i) => ({
        hour: `${6 + (i * 3)} ${i < 2 ? 'AM' : 'PM'}`,
        temp: Math.floor(48 + (Math.random() * 11)),
        rainChance: Math.floor(50 + (Math.random() * 50)),
        humidity: Math.floor(70 + (Math.random() * 30))
      })),
      feelsLike: 55,
      windSpeed: 15,
      uvIndex: 3
    },
    {
      day: 'Wednesday',
      high: 62,
      low: 51,
      description: 'Thunderstorm',
      airQuality: { index: 40, description: 'Good' },
      hourlyDetails: Array(6).fill(null).map((_, i) => ({
        hour: `${6 + (i * 3)} ${i < 2 ? 'AM' : 'PM'}`,
        temp: Math.floor(51 + (Math.random() * 11)),
        rainChance: Math.floor(70 + (Math.random() * 30)),
        humidity: Math.floor(80 + (Math.random() * 20))
      })),
      feelsLike: 60,
      windSpeed: 18,
      uvIndex: 2
    },
    // More days...
    {
      day: 'Thursday',
      high: 65,
      low: 52,
      description: 'Cloudy',
      airQuality: { index: 35, description: 'Good' },
      hourlyDetails: Array(6).fill(null).map((_, i) => ({
        hour: `${6 + (i * 3)} ${i < 2 ? 'AM' : 'PM'}`,
        temp: Math.floor(52 + (Math.random() * 13)),
        rainChance: Math.floor(20 + (Math.random() * 40)),
        humidity: Math.floor(60 + (Math.random() * 20))
      })),
      feelsLike: 63,
      windSpeed: 10,
      uvIndex: 4
    },
  ],
};

// Miami with sunny weather
export const miamiWeather: WeatherData = {
  city: 'Miami',
  temperature: 89,
  description: 'Sunny',
  hourlyForecast: [
    { hour: '10 AM', temp: 85, description: 'Sunny' },
    { hour: '11 AM', temp: 87, description: 'Sunny' },
    { hour: '12 PM', temp: 89, description: 'Sunny' },
    { hour: '1 PM', temp: 90, description: 'Sunny' },
    { hour: '2 PM', temp: 91, description: 'Partly Cloudy' },
  ],
  tenDayForecast: [
    {
      day: 'Tuesday',
      high: 91,
      low: 78,
      description: 'Sunny',
      airQuality: { index: 45, description: 'Good' },
      hourlyDetails: Array(6).fill(null).map((_, i) => ({
        hour: `${6 + (i * 3)} ${i < 2 ? 'AM' : 'PM'}`,
        temp: Math.floor(78 + (Math.random() * 13)),
        rainChance: Math.floor(0 + (Math.random() * 10)),
        humidity: Math.floor(50 + (Math.random() * 20))
      })),
      feelsLike: 93,
      windSpeed: 8,
      uvIndex: 9
    },
    {
      day: 'Wednesday',
      high: 92,
      low: 79,
      description: 'Sunny',
      airQuality: { index: 42, description: 'Good' },
      hourlyDetails: Array(6).fill(null).map((_, i) => ({
        hour: `${6 + (i * 3)} ${i < 2 ? 'AM' : 'PM'}`,
        temp: Math.floor(79 + (Math.random() * 13)),
        rainChance: Math.floor(0 + (Math.random() * 10)),
        humidity: Math.floor(50 + (Math.random() * 20))
      })),
      feelsLike: 94,
      windSpeed: 7,
      uvIndex: 10
    },
    // More days...
    {
      day: 'Thursday',
      high: 90,
      low: 77,
      description: 'Partly Cloudy',
      airQuality: { index: 40, description: 'Good' },
      hourlyDetails: Array(6).fill(null).map((_, i) => ({
        hour: `${6 + (i * 3)} ${i < 2 ? 'AM' : 'PM'}`,
        temp: Math.floor(77 + (Math.random() * 13)),
        rainChance: Math.floor(10 + (Math.random() * 20)),
        humidity: Math.floor(55 + (Math.random() * 20))
      })),
      feelsLike: 92,
      windSpeed: 9,
      uvIndex: 8
    },
  ],
};

// Denver with snow weather
export const denverWeather: WeatherData = {
  city: 'Denver',
  temperature: 32,
  description: 'Snow',
  hourlyForecast: [
    { hour: '10 AM', temp: 30, description: 'Snow' },
    { hour: '11 AM', temp: 31, description: 'Snow' },
    { hour: '12 PM', temp: 32, description: 'Snow' },
    { hour: '1 PM', temp: 33, description: 'Snow' },
    { hour: '2 PM', temp: 34, description: 'Cloudy' },
  ],
  tenDayForecast: [
    {
      day: 'Tuesday',
      high: 35,
      low: 20,
      description: 'Snow',
      airQuality: { index: 30, description: 'Good' },
      hourlyDetails: Array(6).fill(null).map((_, i) => ({
        hour: `${6 + (i * 3)} ${i < 2 ? 'AM' : 'PM'}`,
        temp: Math.floor(20 + (Math.random() * 15)),
        rainChance: Math.floor(70 + (Math.random() * 30)),
        humidity: Math.floor(60 + (Math.random() * 20))
      })),
      feelsLike: 30,
      windSpeed: 12,
      uvIndex: 3
    },
    {
      day: 'Wednesday',
      high: 40,
      low: 25,
      description: 'Cloudy',
      airQuality: { index: 35, description: 'Good' },
      hourlyDetails: Array(6).fill(null).map((_, i) => ({
        hour: `${6 + (i * 3)} ${i < 2 ? 'AM' : 'PM'}`,
        temp: Math.floor(25 + (Math.random() * 15)),
        rainChance: Math.floor(30 + (Math.random() * 30)),
        humidity: Math.floor(50 + (Math.random() * 20))
      })),
      feelsLike: 35,
      windSpeed: 10,
      uvIndex: 4
    },
    // More days...
    {
      day: 'Thursday',
      high: 45,
      low: 28,
      description: 'Partly Cloudy',
      airQuality: { index: 32, description: 'Good' },
      hourlyDetails: Array(6).fill(null).map((_, i) => ({
        hour: `${6 + (i * 3)} ${i < 2 ? 'AM' : 'PM'}`,
        temp: Math.floor(28 + (Math.random() * 17)),
        rainChance: Math.floor(10 + (Math.random() * 20)),
        humidity: Math.floor(40 + (Math.random() * 20))
      })),
      feelsLike: 42,
      windSpeed: 8,
      uvIndex: 5
    },
  ],
};

// Chicago with windy weather
export const chicagoWeather: WeatherData = {
  city: 'Chicago',
  temperature: 55,
  description: 'Windy',
  hourlyForecast: [
    { hour: '10 AM', temp: 52, description: 'Windy' },
    { hour: '11 AM', temp: 53, description: 'Windy' },
    { hour: '12 PM', temp: 55, description: 'Windy' },
    { hour: '1 PM', temp: 56, description: 'Partly Cloudy' },
    { hour: '2 PM', temp: 57, description: 'Partly Cloudy' },
  ],
  tenDayForecast: [
    {
      day: 'Tuesday',
      high: 58,
      low: 45,
      description: 'Windy',
      airQuality: { index: 40, description: 'Good' },
      hourlyDetails: Array(6).fill(null).map((_, i) => ({
        hour: `${6 + (i * 3)} ${i < 2 ? 'AM' : 'PM'}`,
        temp: Math.floor(45 + (Math.random() * 13)),
        rainChance: Math.floor(10 + (Math.random() * 20)),
        humidity: Math.floor(40 + (Math.random() * 20))
      })),
      feelsLike: 52,
      windSpeed: 30,
      uvIndex: 5
    },
    {
      day: 'Wednesday',
      high: 60,
      low: 47,
      description: 'Partly Cloudy',
      airQuality: { index: 38, description: 'Good' },
      hourlyDetails: Array(6).fill(null).map((_, i) => ({
        hour: `${6 + (i * 3)} ${i < 2 ? 'AM' : 'PM'}`,
        temp: Math.floor(47 + (Math.random() * 13)),
        rainChance: Math.floor(20 + (Math.random() * 20)),
        humidity: Math.floor(45 + (Math.random() * 20))
      })),
      feelsLike: 55,
      windSpeed: 15,
      uvIndex: 6
    },
    // More days...
    {
      day: 'Thursday',
      high: 62,
      low: 48,
      description: 'Sunny',
      airQuality: { index: 35, description: 'Good' },
      hourlyDetails: Array(6).fill(null).map((_, i) => ({
        hour: `${6 + (i * 3)} ${i < 2 ? 'AM' : 'PM'}`,
        temp: Math.floor(48 + (Math.random() * 14)),
        rainChance: Math.floor(0 + (Math.random() * 10)),
        humidity: Math.floor(35 + (Math.random() * 20))
      })),
      feelsLike: 60,
      windSpeed: 10,
      uvIndex: 7
    },
  ],
};

// San Francisco with foggy weather
export const sanFranciscoWeather: WeatherData = {
  city: 'San Francisco',
  temperature: 60,
  description: 'Foggy',
  hourlyForecast: [
    { hour: '10 AM', temp: 58, description: 'Foggy' },
    { hour: '11 AM', temp: 59, description: 'Foggy' },
    { hour: '12 PM', temp: 60, description: 'Foggy' },
    { hour: '1 PM', temp: 61, description: 'Cloudy' },
    { hour: '2 PM', temp: 62, description: 'Cloudy' },
  ],
  tenDayForecast: [
    {
      day: 'Tuesday',
      high: 63,
      low: 54,
      description: 'Foggy',
      airQuality: { index: 35, description: 'Good' },
      hourlyDetails: Array(6).fill(null).map((_, i) => ({
        hour: `${6 + (i * 3)} ${i < 2 ? 'AM' : 'PM'}`,
        temp: Math.floor(54 + (Math.random() * 9)),
        rainChance: Math.floor(10 + (Math.random() * 20)),
        humidity: Math.floor(70 + (Math.random() * 20))
      })),
      feelsLike: 61,
      windSpeed: 8,
      uvIndex: 3
    },
    {
      day: 'Wednesday',
      high: 65,
      low: 55,
      description: 'Cloudy',
      airQuality: { index: 32, description: 'Good' },
      hourlyDetails: Array(6).fill(null).map((_, i) => ({
        hour: `${6 + (i * 3)} ${i < 2 ? 'AM' : 'PM'}`,
        temp: Math.floor(55 + (Math.random() * 10)),
        rainChance: Math.floor(20 + (Math.random() * 20)),
        humidity: Math.floor(65 + (Math.random() * 20))
      })),
      feelsLike: 63,
      windSpeed: 10,
      uvIndex: 4
    },
    // More days...
    {
      day: 'Thursday',
      high: 68,
      low: 57,
      description: 'Partly Cloudy',
      airQuality: { index: 30, description: 'Good' },
      hourlyDetails: Array(6).fill(null).map((_, i) => ({
        hour: `${6 + (i * 3)} ${i < 2 ? 'AM' : 'PM'}`,
        temp: Math.floor(57 + (Math.random() * 11)),
        rainChance: Math.floor(5 + (Math.random() * 15)),
        humidity: Math.floor(60 + (Math.random() * 20))
      })),
      feelsLike: 66,
      windSpeed: 12,
      uvIndex: 5
    },
  ],
};

// Default weather data (Paris)
export const weatherData = parisWeather;