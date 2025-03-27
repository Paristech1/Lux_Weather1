# Lux Weather

A luxury weather application with elegant UI and dynamic theming.

![Lux Weather App](screenshot.png)

## Features

- Elegant UI with gold accents and beautiful weather visualizations
- Dynamic theme colors based on weather conditions
- Multiple city management with easy navigation
- Detailed hourly and 10-day forecasts
- Responsive design optimized for mobile devices

## API Optimization

Lux Weather uses Tomorrow.io's weather API with the following optimization strategies:

### Caching and API Usage Management
- Smart caching with 30-minute duration for regular data
- Intelligent cache invalidation based on access patterns
- Least Recently Used (LRU) cache eviction policy
- Background refresh of stale cache entries
- API usage tracking with hourly and daily limits
- Visual feedback on API usage status

### Batching and Concurrency
- Batch fetching for multiple cities with controlled concurrency
- Prioritization of frequently accessed cities
- Automatic fallback to cached data when API limits approached
- Background prefetching for anticipated user actions

### Error Handling
- Graceful degradation with expired cache when API is unavailable
- Informative error messages with fallback options
- Visual indicators for API status and limitations

### Single API Call Optimization
- Combined current, hourly, and daily forecasts in one API call
- Efficient field selection to minimize data transfer
- Geocoding service integration for accurate city coordinates

## Tech Stack

- React + TypeScript
- Vite for fast development and building
- Tailwind CSS for styling
- Lucide React for icons

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Paristech1/Lux_Weather1.git
cd Lux_Weather1
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example` and add your API keys.

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## Building for Production

```bash
npm run build
```

The built files will be available in the `dist` directory.

## License

MIT 