// app/(tabs)/scan.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Dimensions,
  StyleSheet,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import ScreenContainer from "@/components/ui/ScreenContainer";
import Card from "@/components/ui/Card";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { API_URL } from '@/constants/Config';

export default function ScanScreen() {
  const [pickedImage, setPickedImage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const router = useRouter();
  const isIOS = Platform.OS === 'ios';
  const screenWidth = Dimensions.get('window').width;
  const imageHeight = Math.min(screenWidth * 0.6, 250); // Responsive image height

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
    }
  };

  const runOcr = async () => {
    if (!pickedImage) return;
    setIsProcessing(true);
    setExtractedText("");

    try {
      // Upload image to /ocr endpoint
      const ocrText = await uploadImageAndGetText(pickedImage);
      setExtractedText(ocrText);
    } catch (error) {
      console.error("Error in OCR:", error);
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

    const res = await fetch(`${API_URL}/ocr`, {
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

  // Button to analyze results
  const AnalyzeButton = () => (
    <TouchableOpacity
      onPress={() => router.push({ 
        pathname: "/(tabs)/results", 
        params: { 
          text: extractedText,
          imageUri: pickedImage
        } 
      })}
      className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl py-3 shadow-md"
    >
      <View className="flex-row items-center justify-center">
        <Ionicons name="search-outline" size={18} color="#fff" />
        <Text className="text-white font-semibold ml-2">
          Analyze for Allergens
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer>
      {/* Header */}
      <View className="mb-6">
        <Text className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center">
          Scan Product Label
        </Text>
        <Text className="text-center text-gray-600 dark:text-gray-400 mt-1">
          Capture or select a product label to detect allergens
        </Text>
      </View>

      {/* Image Preview Area */}
      <Card 
        variant="outlined"
        style={{ marginBottom: 24 }}
      >
        {pickedImage ? (
          <View>
            <Image
              source={{ uri: pickedImage }}
              style={{ 
                width: "100%", 
                height: imageHeight, 
                borderRadius: 12 
              }}
              resizeMode="cover"
            />
            <View className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-30 py-2 px-3">
              <Text className="text-white text-sm font-medium">
                Image ready for scanning
              </Text>
            </View>
          </View>
        ) : (
          <View 
            className="items-center justify-center" 
            style={{ height: imageHeight }}
          >
            <View className="bg-blue-100 dark:bg-blue-900 rounded-full p-4 mb-4">
              <Ionicons name="image-outline" size={36} color="#3b82f6" />
            </View>
            <Text className="text-gray-700 dark:text-gray-200 text-center font-medium text-lg">
              No image selected
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-center text-sm mt-1">
              Take a photo or select from gallery
            </Text>
          </View>
        )}
      </Card>

      {/* Action Buttons - Improved spacing and appearance */}
      <View className="space-y-4 mb-6">
        <TouchableOpacity
          onPress={takePhotoHandler}
          className="bg-blue-600 rounded-xl py-4 shadow-md mb-4"
          style={{ 
            shadowColor: '#3b82f6',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 3,
          }}
        >
          <View className="flex-row items-center justify-center">
            <Ionicons name="camera-outline" size={22} color="#fff" style={{ marginRight: 10 }} />
            <Text className="text-white font-semibold">Take Photo</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={pickImageHandler}
          className="bg-blue-500 rounded-xl py-4 shadow-md mb-4"
          style={{ 
            shadowColor: '#3b82f6',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 3,
          }}
        >
          <View className="flex-row items-center justify-center">
            <Ionicons name="images-outline" size={22} color="#fff" style={{ marginRight: 10 }} />
            <Text className="text-white font-semibold">Gallery</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={runOcr}
          disabled={!pickedImage || isProcessing}
          className={`rounded-xl py-4 shadow-md ${
            pickedImage && !isProcessing 
              ? "bg-gray-700 dark:bg-gray-800" 
              : "bg-gray-300 dark:bg-gray-700"
          }`}
          style={pickedImage && !isProcessing ? { 
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 3,
          } : {}}
        >
          <View className="flex-row items-center justify-center">
            <Ionicons 
              name="scan-outline" 
              size={22} 
              color={pickedImage && !isProcessing ? "#fff" : "#9ca3af"} 
              style={{ marginRight: 10 }}
            />
            <Text 
              className={`font-semibold ${
                pickedImage && !isProcessing 
                  ? "text-white" 
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {isProcessing ? "Processing..." : "Scan Label"}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Processing Indicator */}
      {isProcessing && (
        <Card variant="outlined" style={{ marginBottom: 20 }}>
          <View className="flex-row items-center justify-center py-3 space-x-3">
            <ActivityIndicator size="small" color="#3b82f6" />
            <Text className="text-blue-700 dark:text-blue-300 font-medium">
              Reading text from image...
            </Text>
          </View>
        </Card>
      )}

      {/* Extracted Text Result */}
      {extractedText ? (
        <Card 
          title="Extracted Text" 
          icon="document-text-outline"
          variant="elevated"
          footer={<AnalyzeButton />}
        >
          <View className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <Text className="text-gray-800 dark:text-gray-200">
              {extractedText}
            </Text>
          </View>
        </Card>
      ) : null}
    </ScreenContainer>
  );
}
