import React, { useState } from "react";
import { View, Text, Button, Image } from "react-native";
import { Link } from "expo-router";
import * as ImagePicker from "expo-image-picker";

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
    try {
      // ... call Tesseract or do OCR here ...
      const mockText = "Milk, Sugar, Wheat Flour";
      setExtractedText(mockText);
    } catch (error) {
      console.log("OCR Error:", error);
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-white p-4">
      <Text className="text-lg font-bold">Scan Product Label</Text>

      {pickedImage && (
        <Image
          source={{ uri: pickedImage }}
          style={{ width: 200, height: 200, marginVertical: 10 }}
        />
      )}

      <Button title="Pick Image" onPress={pickImageHandler} />
      <Button title="Run OCR" onPress={runOcr} />

      {extractedText ? (
        <>
          <Text className="mt-4">Extracted Text:</Text>
          <Text className="mt-1 font-semibold">{extractedText}</Text>
          <Link
            href={{ pathname: "/(tabs)/results", params: { text: extractedText } }}
            className="mt-4 text-blue-600"
          >
            View Allergen Results
          </Link>
        </>
      ) : null}
    </View>
  );
}
