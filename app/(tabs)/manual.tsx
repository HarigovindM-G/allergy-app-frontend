import React, { useState } from "react";
import { View, Text, TextInput } from "react-native";
import { Link } from "expo-router";

export default function ManualInputScreen() {
  const [ingredientText, setIngredientText] = useState("");

  return (
    <View className="flex-1 items-center justify-center bg-white p-4">
      <Text className="text-lg font-bold">Manual Input</Text>
      <Text className="mb-4 text-gray-600">
        Type or paste ingredients below:
      </Text>
      <TextInput
        className="w-full border border-gray-300 rounded px-2 py-1"
        multiline
        numberOfLines={6}
        placeholder="e.g. Milk, Sugar, Wheat Flour"
        value={ingredientText}
        onChangeText={setIngredientText}
      />
      <Link
        href={{
          pathname: "/(tabs)/results",
          params: { text: ingredientText },
        }}
        className="mt-4 text-blue-600"
      >
        Check Allergens
      </Link>
    </View>
  );
}
