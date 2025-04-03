import { Platform } from "react-native";

// API configuration
// Use localhost for emulator/simulator, or use IP address for real device
export const API_URL =
  Platform.OS === "web" ? "http://localhost:8000" : "http://192.168.1.82:8000"; // Make sure your IP is correct

// For debugging, log which URL is being used
console.log(`Using API URL: ${API_URL}`);

// Helper to build correct API URLs to avoid redirect issues
export const getApiUrl = (endpoint: string) => {
  // Remove trailing slash from API_URL if it exists
  const baseUrl = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL;

  // Make sure endpoint starts with a slash
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  // Always add trailing slash to avoid redirects
  const finalEndpoint = cleanEndpoint.endsWith("/")
    ? cleanEndpoint
    : `${cleanEndpoint}/`;

  return `${baseUrl}${finalEndpoint}`;
};

// Other configuration constants can be added here
export const APP_NAME = "Allergy Detection App";
