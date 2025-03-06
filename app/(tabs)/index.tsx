import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRouter } from "expo-router";

// If you followed the previous advice and created a reusable
// ScreenContainer component, import it:
import ScreenContainer from "@/components/ui/ScreenContainer"; 
// Otherwise, just wrap everything in a <View> with your styling.

export default function HomeScreen() {
  const router = useRouter();

  // Simple logout function: remove token & redirect to (auth)/login
  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    router.replace("/(auth)/login");
  };

  return (
    <ScreenContainer>
      {/* Big icon for a visual brand accent */}
      {/* <Ionicons
        name="leaf-outline"
        size={64}
        color="#2563eb"
        style={{ alignSelf: "center", marginBottom: 16 }}
      /> */}
      <FontAwesome5 name="syringe" size={70} color="#2563eb"
        style={{ alignSelf: "center", marginBottom: 24, marginTop:24 }} />

      {/* Main heading */}
      <Text className="text-2xl font-extrabold text-gray-900 dark:text-gray-100 text-center">
        Allergy Management
      </Text>
      <Text className="mt-2 text-base text-center text-gray-600 dark:text-gray-400">
        Scan, detect, and stay safe from allergens.
      </Text>

      {/* Action buttons */}
      <View className="mt-8 space-y-3 self-center w-full">
        <TouchableOpacity
          className="flex-row items-center justify-center bg-blue-600 rounded-full py-3 px-6 shadow-md mx-6 mb-4"
          onPress={() => router.push("/(tabs)/scan")}
        >
          <Ionicons name="camera-outline" size={20} color="#fff" />
          <Text className="text-white font-semibold text-base ml-2">Scan Product</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center justify-center bg-blue-600 rounded-full py-3 px-6 shadow-md mx-6"
          onPress={() => router.push("/(tabs)/manual")}
        >
          <Ionicons name="create-outline" size={20} color="#fff" />
          <Text className="text-white font-semibold text-base ml-2">Enter Manually</Text>
        </TouchableOpacity>
      </View>

      {/* Logout button */}
      <View className="mt-10 self-center w-full">
        <TouchableOpacity
          className="flex-row items-center justify-center bg-red-600 rounded-full py-3 px-6 shadow-md mx-6"
          onPress={handleLogout}
        >
          <Ionicons name="exit-outline" size={20} color="#fff" />
          <Text className="text-white font-semibold text-base ml-2">Logout</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}
