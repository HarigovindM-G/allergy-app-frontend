import React, { useState } from "react";
import { 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  ScrollView,
  Alert,
  KeyboardAvoidingView, 
  Platform, 
  Keyboard, 
  TouchableWithoutFeedback
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import ScreenContainer from "@/components/ui/ScreenContainer";
import Card from "@/components/ui/Card";
import { API_URL } from '@/constants/Config';

export default function ManualInputScreen() {
  const [ingredientText, setIngredientText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewEnabled, setPreviewEnabled] = useState(false);
  const router = useRouter();

  const handleCheckAllergens = async () => {
    if (!ingredientText.trim()) {
      Alert.alert("Error", "Please enter ingredients text before checking for allergens");
      return;
    }

    // Option 1: Direct navigation to results page with text parameter
    // The results page will handle the API call
    router.push({
      pathname: "/(tabs)/results",
      params: { text: ingredientText.trim() },
    });
  };

  const exampleIngredients = [
    "Water, Wheat Flour, Sugar, Milk, Eggs, Palm Oil, Yeast, Salt",
    "Sugar, Palm Oil, Hazelnuts (13%), Skim Milk Powder (8.7%), Fat-Reduced Cocoa (7.4%), Emulsifier: Lecithin (Soy), Vanillin",
    "Whole Grain Oats, Corn Starch, Sugar, Salt, Tripotassium Phosphate, Vitamin E"
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScreenContainer scrollable={true}>
          {/* Header */}
          <View className="mb-6">
            <Text className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center">
              Manual Ingredient Entry
            </Text>
            <Text className="text-center text-gray-600 dark:text-gray-400 mt-2">
              Enter product ingredients to check for allergens
            </Text>
          </View>

          {/* Input Card */}
          <Card 
            title="Ingredients List"
            icon="list-outline"
            variant="elevated"
            style={{ marginBottom: 20 }}
          >
            <Text className="text-gray-700 dark:text-gray-300 mb-3">
              Type or paste the ingredients list:
            </Text>
            
            <TextInput
              className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 mb-4"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              style={{ minHeight: 120 }}
              value={ingredientText}
              onChangeText={(text) => {
                setIngredientText(text);
                // Enable preview when there's text
                setPreviewEnabled(text.trim().length > 0);
              }}
              placeholder="e.g. Water, Wheat Flour, Sugar, Milk, Eggs, Palm Oil, Yeast, Salt"
              placeholderTextColor="#9ca3af"
            />
            
            <TouchableOpacity
              onPress={handleCheckAllergens}
              disabled={!previewEnabled || isProcessing}
              className={`rounded-xl py-4 shadow-md ${
                previewEnabled && !isProcessing 
                  ? "bg-blue-600" 
                  : "bg-gray-300 dark:bg-gray-700"
              }`}
            >
              <View className="flex-row items-center justify-center">
                {isProcessing ? (
                  <>
                    <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                    <Text className="text-white font-semibold">
                      Processing...
                    </Text>
                  </>
                ) : (
                  <>
                    <Ionicons 
                      name="search" 
                      size={22} 
                      color={previewEnabled ? "#fff" : "#9ca3af"} 
                      style={{ marginRight: 8 }}
                    />
                    <Text 
                      className={`font-semibold ${
                        previewEnabled 
                          ? "text-white" 
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      Check Allergens
                    </Text>
                  </>
                )}
              </View>
            </TouchableOpacity>
          </Card>

          {/* Examples Section */}
          <Card
            title="Example Ingredients"
            icon="information-circle-outline"
            variant="outlined"
          >
            <Text className="text-gray-700 dark:text-gray-300 mb-3">
              Tap an example to use it:
            </Text>
            
            <View className="space-y-3">
              {exampleIngredients.map((example, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    setIngredientText(example);
                    setPreviewEnabled(true);
                  }}
                  className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <Text className="text-gray-700 dark:text-gray-300" numberOfLines={2}>
                    {example}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Text className="text-gray-500 dark:text-gray-400 text-sm italic">
                Tip: For accurate detection, enter the full ingredients list exactly as it appears on the product packaging.
              </Text>
            </View>
          </Card>
        </ScreenContainer>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
