// app/(tabs)/results.tsx
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import ScreenContainer from "@/components/ui/ScreenContainer";
import { useLocalSearchParams } from "expo-router";

export default function ResultsScreen() {
  const { text } = useLocalSearchParams();
  const [allergens, setAllergens] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (text) {
      detectAllergens(String(text));
    }
  }, [text]);

  const detectAllergens = async (inputText: string) => {
    setLoading(true);
    try {
      const res = await fetch("http://192.168.1.72:8000/allergens/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Allergen detection failed: ${res.status} - ${errorText}`);
      }
      const data = await res.json();
      setAllergens(data.allergens || []);
    } catch (error) {
      console.error("Error in detectAllergens:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      {/* Main heading */}
      <Text className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        Allergen Results
      </Text>

      {/* If no text or loading */}
      {!text && (
        <Text className="text-red-500 mb-4">No text provided.</Text>
      )}
      {loading && <ActivityIndicator size="large" color="#555" />}

      {/* The "Result #1" card container */}
      {!loading && text && (
        <View className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <Text className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
            Result #1
          </Text>

          {/* If we have allergens, list them; otherwise "No allergens detected" */}
          {allergens.length > 0 ? (
            <View className="space-y-4">
              {allergens.map((item, idx) => (
                <View
                  key={idx}
                  className="bg-gray-50 dark:bg-gray-700 rounded-md p-3 shadow-sm mb-2"
                >
                  <Text className="text-gray-900 dark:text-gray-100 font-semibold">
                    {item.allergen} (Confidence: {item.confidence.toFixed(2)})
                  </Text>
                  {item.evidence && item.evidence.length > 0 && (
                    <View className="mt-2 ml-2">
                      {item.evidence.map((ev: string, eIdx: number) => (
                        <Text
                          key={eIdx}
                          className="text-gray-600 dark:text-gray-300 text-sm"
                        >
                          • {ev}
                        </Text>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          ) : (
            <Text className="mt-2 text-gray-600 dark:text-gray-400">
              No allergens detected.
            </Text>
          )}
        </View>
      )}
    </ScreenContainer>
  );
}
