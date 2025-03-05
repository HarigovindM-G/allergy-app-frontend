// app/(tabs)/emergency.tsx
import React from "react";
import { Text, View } from "react-native";
import ScreenContainer from "@/components/ui/ScreenContainer";
import { Ionicons } from "@expo/vector-icons";

export default function EmergencyScreen() {
  return (
    <ScreenContainer>
      <View className="flex-row items-center mb-4">
        <Ionicons name="warning-outline" size={28} color="#dc2626" />
        <Text className="ml-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
          Emergency Steps
        </Text>
      </View>
      <View className="space-y-3">
        <Text className="text-gray-800 dark:text-gray-200">
          1. Use EpiPen if you experience severe symptoms (difficulty breathing, swelling, etc.).
        </Text>
        <Text className="text-gray-800 dark:text-gray-200">
          2. Call emergency services immediately (Dial 911 or local equivalent).
        </Text>
        <Text className="text-gray-800 dark:text-gray-200">
          3. Lie down and elevate legs if feeling faint.
        </Text>
        <Text className="text-gray-800 dark:text-gray-200">
          4. If symptoms worsen, seek urgent medical care.
        </Text>
      </View>
    </ScreenContainer>
  );
}
