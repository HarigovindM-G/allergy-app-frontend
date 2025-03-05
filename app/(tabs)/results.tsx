// app/(tabs)/results.tsx
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import ScreenContainer from "@/components/ui/ScreenContainer";
import { useLocalSearchParams } from "expo-router";

export default function ResultsScreen() {
  const { text } = useLocalSearchParams();
  const [allergens, setAllergens] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (text) {
      detectAllergens(String(text));
    }
  }, [text]);

  const detectAllergens = async (inputText: string) => {
    setLoading(true);
    try {
      // fetch from your backend
      // mock response
      setAllergens(["Milk", "Soy"]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Text className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        Allergen Results
      </Text>

      {!text && (
        <Text className="text-red-500">No text provided.</Text>
      )}

      {loading && <ActivityIndicator size="large" />}

      {!loading && allergens.length > 0 && (
        <View className="mt-4 space-y-2">
          {allergens.map((item, idx) => (
            <View
              key={idx}
              className="flex-row items-center bg-white dark:bg-gray-800 rounded-md p-3 shadow-sm"
            >
              <View className="w-2 h-2 rounded-full bg-red-500 mr-2" />
              <Text className="text-gray-900 dark:text-gray-100">
                {item}
              </Text>
            </View>
          ))}
        </View>
      )}

      {!loading && allergens.length === 0 && text && (
        <Text className="mt-4 text-gray-600 dark:text-gray-400">
          No allergens detected.
        </Text>
      )}
    </ScreenContainer>
  );
}
