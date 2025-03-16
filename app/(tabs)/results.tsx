// app/(tabs)/results.tsx
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View, TouchableOpacity } from "react-native";
import ScreenContainer from "@/components/ui/ScreenContainer";
import Card from "@/components/ui/Card";
import { useLocalSearchParams, useRouter } from "expo-router";
import { API_URL } from '@/constants/Config';
import { Ionicons } from "@expo/vector-icons";

// Define the allergen type for better type safety
interface Allergen {
  allergen: string;
  confidence: number;
  evidence: string[] | null;
}

export default function ResultsScreen() {
  const { text } = useLocalSearchParams();
  const [allergens, setAllergens] = useState<Allergen[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (text) {
      detectAllergens(String(text));
    }
  }, [text]);

  const detectAllergens = async (inputText: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/allergens/detect`, {
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
      setError("Failed to detect allergens. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Get the confidence level color
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-red-600 dark:text-red-400";
    if (confidence >= 0.5) return "text-orange-600 dark:text-orange-400";
    return "text-yellow-600 dark:text-yellow-400";
  };

  // Get the confidence level icon
  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.8) return "alert-circle";
    if (confidence >= 0.5) return "warning";
    return "information-circle";
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="mb-6">
        <Text className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center">
          Allergen Results
        </Text>
        <Text className="text-center text-gray-600 dark:text-gray-400 mt-1">
          Analysis of potential allergens in your product
        </Text>
      </View>

      {/* Error state */}
      {error && (
        <Card variant="outlined" style={{ marginBottom: 20 }}>
          <View className="flex-row items-center">
            <Ionicons name="alert-circle" size={24} color="#ef4444" style={{ marginRight: 8 }} />
            <Text className="text-red-600 flex-1">{error}</Text>
          </View>
        </Card>
      )}

      {/* Loading state */}
      {loading && (
        <Card variant="outlined">
          <View className="items-center py-8">
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text className="text-blue-600 dark:text-blue-400 mt-4 font-medium">
              Analyzing for allergens...
            </Text>
          </View>
        </Card>
      )}

      {/* No text provided */}
      {!text && !loading && (
        <Card variant="outlined">
          <View className="items-center py-6">
            <Ionicons name="document-text-outline" size={48} color="#9ca3af" style={{ marginBottom: 16 }} />
            <Text className="text-gray-600 dark:text-gray-400 text-center mb-2">
              No text provided for analysis
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/scan")}
              className="bg-blue-600 rounded-xl py-2 px-4 mt-2"
            >
              <Text className="text-white font-medium">Go to Scanner</Text>
            </TouchableOpacity>
          </View>
        </Card>
      )}

      {/* Results */}
      {!loading && text && (
        <Card 
          title="Analysis Results" 
          icon="flask-outline"
          variant="elevated"
        >
          {allergens.length > 0 ? (
            <View className="space-y-3">
              {allergens.map((item, idx) => (
                <View
                  key={idx}
                  className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 shadow-sm"
                >
                  <View className="flex-row items-center mb-2">
                    <Ionicons 
                      name={getConfidenceIcon(item.confidence)} 
                      size={20} 
                      color={item.confidence >= 0.8 ? "#dc2626" : item.confidence >= 0.5 ? "#ea580c" : "#ca8a04"} 
                      style={{ marginRight: 8 }}
                    />
                    <Text className="text-gray-900 dark:text-gray-100 font-bold text-lg flex-1">
                      {item.allergen}
                    </Text>
                    <View className="bg-gray-200 dark:bg-gray-600 rounded-full px-2 py-1">
                      <Text className={`${getConfidenceColor(item.confidence)} font-medium text-sm`}>
                        {(item.confidence * 100).toFixed(0)}% match
                      </Text>
                    </View>
                  </View>
                  
                  {item.evidence && item.evidence.length > 0 && (
                    <View className="mt-2 bg-white dark:bg-gray-800 rounded-lg p-3">
                      <Text className="text-gray-700 dark:text-gray-300 font-medium mb-1">
                        Evidence Found:
                      </Text>
                      {item.evidence.map((ev: string, eIdx: number) => (
                        <View key={eIdx} className="flex-row items-center mt-1">
                          <View className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
                          <Text className="text-gray-600 dark:text-gray-300 text-sm flex-1">
                            {ev}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>
          ) : (
            <View className="items-center py-6">
              <Ionicons name="checkmark-circle" size={48} color="#22c55e" style={{ marginBottom: 12 }} />
              <Text className="text-green-600 dark:text-green-400 font-medium text-lg text-center">
                No allergens detected
              </Text>
              <Text className="text-gray-500 dark:text-gray-400 text-center mt-2">
                The analyzed text doesn't contain any known allergens
              </Text>
            </View>
          )}
        </Card>
      )}
    </ScreenContainer>
  );
}
