import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
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
      const response = await fetch("", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }),
      });
      const data = await response.json();
      setAllergens(data.allergens || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-white p-4">
      <Text className="text-xl font-bold">Allergen Results</Text>
      {!text && (
        <Text className="mt-2 text-red-500">
          No text provided.
        </Text>
      )}
      {loading && <ActivityIndicator size="large" />}
      {!loading && allergens.length > 0 && (
        <View>
          <Text className="mt-4 text-lg font-semibold">Detected:</Text>
          {allergens.map((item, idx) => (
            <Text key={idx} className="mt-1">
              • {item}
            </Text>
          ))}
        </View>
      )}
      {!loading && allergens.length === 0 && text && (
        <Text className="mt-4">No allergens detected.</Text>
      )}
    </View>
  );
}
