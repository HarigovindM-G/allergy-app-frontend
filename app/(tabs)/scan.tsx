// app/(tabs)/scan.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import ScreenContainer from "@/components/ui/ScreenContainer";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";

export default function ScanScreen() {
  const [pickedImage, setPickedImage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [allergenResults, setAllergenResults] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === "granted";
  };

  const requestLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === "granted";
  };

  // Take photo
  const takePhotoHandler = async () => {
    const granted = await requestCameraPermission();
    if (!granted) {
      alert("Camera permission is required.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 1 });
    if (!result.canceled) {
      setPickedImage(result.assets[0].uri);
      setExtractedText("");
      setAllergenResults(null);
    }
  };

  // Pick from gallery
  const pickImageHandler = async () => {
    const granted = await requestLibraryPermission();
    if (!granted) {
      alert("Photo library permission is required.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 1 });
    if (!result.canceled) {
      setPickedImage(result.assets[0].uri);
      setExtractedText("");
      setAllergenResults(null);
    }
  };

  const runOcr = async () => {
    if (!pickedImage) return;
    setIsProcessing(true);
    setExtractedText("");
    setAllergenResults(null);

    try {
      // 1) First, upload image to /ocr
      const ocrText = await uploadImageAndGetText(pickedImage);
      setExtractedText(ocrText);

      // 2) Then, send that text to /allergens/detect
      const allergensData = await detectAllergens(ocrText);
      setAllergenResults(allergensData);

    } catch (error) {
      console.error("Error in OCR/Allergen detection:", error);
      alert(String(error));
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper: Upload to /ocr
  const uploadImageAndGetText = async (imageUri: string) => {
    const fileName = `image_${Date.now()}.jpg`;
    const formData = new FormData();

    if (Platform.OS === "web") {
      const blob = await fetch(imageUri).then((r) => r.blob());
      const file = new File([blob], fileName, { type: "image/jpeg" });
      formData.append("file", file);
    } else {
      formData.append("file", { uri: imageUri, name: fileName, type: "image/jpeg" } as any);
    }

    const res = await fetch("http://192.168.1.71:8000/ocr", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`OCR failed: ${res.status} - ${errorText}`);
    }
    const data = await res.json();
    return data.text || "";
  };

  // Helper: Call /allergens/detect
  const detectAllergens = async (text: string) => {
    const res = await fetch("http://192.168.1.71:8000/allergens/detect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Allergen detection failed: ${res.status} - ${errorText}`);
    }
    return await res.json();
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
          <Text className="text-gray-500 dark:text-gray-400 mt-2">No image selected</Text>
        </View>
      )}

      <View className="flex-row space-x-2">
        <TouchableOpacity
          onPress={takePhotoHandler}
          className="flex-1 flex-row items-center justify-center bg-blue-600 rounded-md py-3 shadow"
        >
          <Ionicons name="camera-outline" size={20} color="#fff" />
          <Text className="text-white font-semibold ml-2">Take Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={pickImageHandler}
          className="flex-1 flex-row items-center justify-center bg-blue-600 rounded-md py-3 shadow"
        >
          <Ionicons name="images-outline" size={20} color="#fff" />
          <Text className="text-white font-semibold ml-2">Pick Image</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={runOcr}
        disabled={!pickedImage || isProcessing}
        className={`mt-4 flex-row items-center justify-center 
          ${pickedImage && !isProcessing ? "bg-green-600" : "bg-gray-400"} 
          rounded-md py-3 shadow`}
      >
        <Ionicons name="scan-outline" size={20} color="#fff" />
        <Text className="text-white font-semibold ml-2">
          {isProcessing ? "Processing..." : "Run OCR"}
        </Text>
      </TouchableOpacity>

      {isProcessing && (
        <View className="mt-4 flex-row items-center space-x-2">
          <ActivityIndicator size="small" color="#555" />
          <Text className="text-gray-500 dark:text-gray-400">Reading text...</Text>
        </View>
      )}

      {/* Show the extracted text, if any */}
      {extractedText ? (
        <View className="mt-4 rounded-md bg-gray-100 dark:bg-gray-800 p-4">
          <Text className="text-gray-800 dark:text-gray-100 font-medium mb-1">
            Extracted Text:
          </Text>
          <Text className="font-semibold text-gray-900 dark:text-gray-200 mb-2">
            {extractedText}
          </Text>

          {/* If we also have allergen results, show them */}
          {allergenResults && allergenResults.allergens && allergenResults.allergens.length > 0 ? (
            <View>
              <Text className="text-gray-800 dark:text-gray-100 font-medium mb-1">
                Detected Allergens:
              </Text>
              {allergenResults.allergens.map((item: any, idx: number) => (
                <Text key={idx} className="text-red-500">
                  {item.allergen} (Confidence: {item.confidence.toFixed(2)})
                </Text>
              ))}
            </View>
          ) : (
            <Text className="text-gray-500 dark:text-gray-400">
              No allergens detected
            </Text>
          )}

          {/* Or link to a separate results screen if you want */}
          {/* 
          <Link
            href={{ pathname: "/(tabs)/results", params: { text: extractedText } }}
            className="text-blue-600 dark:text-blue-400 mt-3"
          >
            View Detailed Results →
          </Link>
          */}
        </View>
      ) : null}
    </ScreenContainer>
  );
}
