// app/(tabs)/scan.tsx
import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import * as ImagePicker from "expo-image-picker";
import ScreenContainer from "@/components/ui/ScreenContainer";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";

export default function ScanScreen() {
  const [pickedImage, setPickedImage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");

  const pickImageHandler = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      setPickedImage(result.assets[0].uri);
    }
  };

  const runOcr = async () => {
    if (!pickedImage) return;
    // mock or real OCR
    setExtractedText("Milk, Sugar, Wheat Flour");
  };

  return (
    <ScreenContainer>
      <Text className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        Scan Product Label
      </Text>

      {pickedImage && (
        <View className="rounded-xl bg-white dark:bg-gray-800 shadow-md p-4 mb-4">
          <Image
            source={{ uri: pickedImage }}
            style={{ width: "100%", height: 200, borderRadius: 8 }}
            resizeMode="cover"
          />
        </View>
      )}

      {!pickedImage && (
        <View className="rounded-xl bg-gray-200 dark:bg-gray-700 p-6 items-center mb-4">
          <Ionicons name="image-outline" size={48} color="#888" />
          <Text className="text-gray-500 dark:text-gray-400 mt-2">
            No image selected
          </Text>
        </View>
      )}

      <View className="flex-row space-x-2">
        <TouchableOpacity
          onPress={pickImageHandler}
          className="flex-1 flex-row items-center justify-center bg-blue-600 rounded-md py-3 shadow"
        >
          <Ionicons name="images-outline" size={20} color="#fff" />
          <Text className="text-white font-semibold ml-2">Pick Image</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={runOcr}
          className="flex-1 flex-row items-center justify-center bg-green-600 rounded-md py-3 shadow"
        >
          <Ionicons name="scan-outline" size={20} color="#fff" />
          <Text className="text-white font-semibold ml-2">Run OCR</Text>
        </TouchableOpacity>
      </View>

      {extractedText ? (
        <View className="mt-4 rounded-md bg-gray-100 dark:bg-gray-800 p-4">
          <Text className="text-gray-800 dark:text-gray-100">
            Extracted Text:
          </Text>
          <Text className="font-semibold text-gray-900 dark:text-gray-200">
            {extractedText}
          </Text>

          <Link
            href={{ pathname: "/(tabs)/results", params: { text: extractedText } }}
            className="text-blue-600 dark:text-blue-400 mt-3"
          >
            View Allergen Results →
          </Link>
        </View>
      ) : null}
    </ScreenContainer>
  );
}
