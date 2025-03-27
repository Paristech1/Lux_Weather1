import React from 'react';
import { 
  getRemainingApiCalls, 
  getRemainingDailyApiCalls,
  isNearApiLimit
} from '../api/tomorrowApiConfig';

interface ApiUsageDisplayProps {
  className?: string;
  showDetailed?: boolean;
}

/**
 * Component to display API usage information in the UI
 * 
 * Displays:
 * - Hourly API calls remaining
 * - Daily API calls remaining (if showDetailed)
 * - Visual indicator of API usage status
 */
const ApiUsageDisplay: React.FC<ApiUsageDisplayProps> = ({ 
  className = '', 
  showDetailed = false 
}) => {
  const [hourlyCallsLeft, setHourlyCallsLeft] = React.useState(getRemainingApiCalls());
  const [dailyCallsLeft, setDailyCallsLeft] = React.useState(getRemainingDailyApiCalls());
  const [isNearLimit, setIsNearLimit] = React.useState(isNearApiLimit());
  
  // Update API status every minute
  React.useEffect(() => {
    const updateApiStatus = () => {
      setHourlyCallsLeft(getRemainingApiCalls());
      setDailyCallsLeft(getRemainingDailyApiCalls());
      setIsNearLimit(isNearApiLimit());
    };
    
    // Initial update
    updateApiStatus();
    
    // Set interval for updates
    const interval = setInterval(updateApiStatus, 60000);
    return () => clearInterval(interval);
  }, []);
  
  // Determine status color
  const getStatusColor = () => {
    if (hourlyCallsLeft <= 3 || dailyCallsLeft <= 50) return 'text-red-500';
    if (hourlyCallsLeft <= 10 || dailyCallsLeft <= 200) return 'text-amber-500';
    return 'text-green-500';
  };
  
  return (
    <div className={`flex flex-col items-end text-xs ${className}`}>
      <div className="flex items-center">
        <span className="mr-2">API:</span>
        <span className={getStatusColor()}>
          {hourlyCallsLeft} left this hour
        </span>
      </div>
      
      {showDetailed && (
        <div className="flex items-center mt-1">
          <span className="mr-2">Daily:</span>
          <span className={getStatusColor()}>
            {dailyCallsLeft} / 1000
          </span>
        </div>
      )}
      
      {isNearLimit && (
        <div className="text-amber-500 mt-1">
          Approaching API limit
        </div>
      )}
    </div>
  );
};

export default ApiUsageDisplay; 