import React, { useState } from "react";
import { Text, View, TextInput, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform } from "react-native";

// If you have a reusable ScreenContainer for layout:
import ScreenContainer from "@/components/ui/ScreenContainer";
// Otherwise, replace <ScreenContainer> with a <View> 
// that has your desired styles (padding, background, etc.).

export default function ManualInputScreen() {
  const [ingredientText, setIngredientText] = useState("");
  const router = useRouter();

  const handleCheckAllergens = () => {
    if (!ingredientText.trim()) {
      // Optionally show an error message or toast
      return;
    }
    // Navigate to the results screen, passing the text as a param
    router.push({
      pathname: "/(tabs)/results",
      params: { text: ingredientText },
    });
  };

  return (
    <KeyboardAvoidingView
    behavior={Platform.OS === "ios" ? "padding" : "height"}
    style={{ flex: 1 }}
  >
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <ScreenContainer>
      <Text className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        Manual Entry
      </Text>

      <Text className="text-gray-600 dark:text-gray-400 mb-2">
        Enter the ingredients or product details below:
      </Text>

      <View className="rounded-md bg-white dark:bg-gray-800 shadow p-4 mb-4">
        <TextInput
          className="text-gray-800 dark:text-gray-100"
          multiline
          numberOfLines={5}
          value={ingredientText}
          onChangeText={setIngredientText}
          placeholder="e.g. Milk, Sugar, Wheat Flour"
          placeholderTextColor="#888"
        />
      </View>

      <TouchableOpacity
        onPress={handleCheckAllergens}
        className="flex-row items-center justify-center bg-blue-600 rounded-full py-3 px-6 shadow-md self-center w-full"
      >
        <Ionicons name="search-outline" size={20} color="#fff" />
        <Text className="text-white font-semibold text-base ml-2">
          Check Allergens
        </Text>
      </TouchableOpacity>
    </ScreenContainer>
    </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
