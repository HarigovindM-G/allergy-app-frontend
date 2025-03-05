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
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      alert("Camera access is required to take a picture.");
      return false;
    }
    return true;
  };

  const requestLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Photo library access is required to pick an image.");
      return false;
    }
    return true;
  };

  // Take photo
  const takePhotoHandler = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      // aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setPickedImage(result.assets[0].uri);
      setExtractedText("");
    }
  };

  // Pick from gallery
  const pickImageHandler = async () => {
    const hasPermission = await requestLibraryPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      // aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setPickedImage(result.assets[0].uri);
      setExtractedText("");
    }
  };

  // Upload to FastAPI OCR endpoint
  const runOcr = async () => {
    if (!pickedImage) return;
    setExtractedText("");
    setIsProcessing(true);

    try {
      // Build form data
      const fileName = `image_${Date.now()}.jpg`;
      const formData = new FormData();

      if (Platform.OS === "web") {
        // ---- WEB: Convert blob URL to actual File
        const blob = await fetch(pickedImage).then((r) => r.blob());
        const file = new File([blob], fileName, { type: "image/jpeg" });
        formData.append("file", file);
      } else {
        // ---- iOS/Android
        formData.append("file", {
          uri: pickedImage,
          name: fileName,
          type: "image/jpeg",
        } as any);
      }

      const res = await fetch("http://192.168.1.71:8000/ocr", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Error response:", errorText);
        throw new Error(`Server error: ${res.status} - ${errorText}`);
      }

      const data = await res.json();
      setExtractedText(data.text || "No text detected");
    } catch (error) {
      console.error("OCR error:", error);
      alert(
        error instanceof Error ? `OCR Failed: ${error.message}` : "OCR Failed"
      );
    } finally {
      setIsProcessing(false);
    }
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

      {extractedText ? (
        <View className="mt-4 rounded-md bg-gray-100 dark:bg-gray-800 p-4">
          <Text className="text-gray-800 dark:text-gray-100 font-medium mb-1">
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
