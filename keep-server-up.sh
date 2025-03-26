#!/bin/bash

# Set the max attempts to prevent infinite loops if something is fundamentally broken
MAX_ATTEMPTS=100
attempts=0

echo "Starting Vite server monitor..."

while [ $attempts -lt $MAX_ATTEMPTS ]; do
    echo "Starting Vite server (attempt $((attempts+1)))"
    
    # Start the Vite server in the background and capture its PID
    npm run dev &
    VITE_PID=$!
    
    # Wait for a moment to let the server initialize
    sleep 5
    
    echo "Vite server running with PID: $VITE_PID"
    echo "Press Ctrl+C to stop the monitor and server"
    
    # Wait for the process to finish
    wait $VITE_PID
    
    echo "Vite server stopped. Restarting in 2 seconds..."
    sleep 2
    
    attempts=$((attempts+1))
done

echo "Reached maximum restart attempts ($MAX_ATTEMPTS). Please check for issues with your application." 