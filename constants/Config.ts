import { Platform } from "react-native";

// API configuration
// Use localhost for emulator/simulator, or use IP address for real device
export const API_URL =
  Platform.OS === "web"
    ? "http://localhost:8000"
    : "http://192.168.1.71:8000"; // Make sure your IP is correct

// For debugging, log which URL is being used
console.log(`Using API URL: ${API_URL}`);

// Other configuration constants can be added here
export const APP_NAME = "Allergy Detection App";
