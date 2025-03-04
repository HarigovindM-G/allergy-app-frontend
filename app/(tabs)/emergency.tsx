import React from "react";
import { ScrollView, Text } from "react-native";

export default function EmergencyScreen() {
  return (
    <ScrollView className="flex-1 bg-white p-4">
      <Text className="text-xl font-bold mb-2">Emergency Steps</Text>
      <Text className="mt-2">
        1. Use EpiPen if you experience severe symptoms (difficulty breathing, swelling, etc.).
      </Text>
      <Text className="mt-2">2. Call emergency services immediately.</Text>
      <Text className="mt-2">3. Lie down and elevate legs if feeling faint.</Text>
      <Text className="mt-2">
        4. If symptoms continue to worsen, seek urgent medical care.
      </Text>
    </ScrollView>
  );
}
