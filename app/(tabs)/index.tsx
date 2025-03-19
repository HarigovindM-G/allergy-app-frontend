import React from "react";
import { Text, TouchableOpacity, View, Platform, Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useRouter } from "expo-router";
import ScreenContainer from "@/components/ui/ScreenContainer";
import Card from "@/components/ui/Card";
import { useAuth } from "@/hooks/useAuth";

// If you followed the previous advice and created a reusable
// ScreenContainer component, import it:
// Otherwise, just wrap everything in a <View> with your styling.

export default function HomeScreen() {
  const router = useRouter();
  const { logout, user } = useAuth();
  const isIOS = Platform.OS === 'ios';

  // Feature cards data
  const features = [
    {
      title: "Scan Products",
      description: "Scan product labels to detect potential allergens",
      icon: "camera-outline" as const,
      route: "/(tabs)/scan" as const,
      color: "#3b82f6", // blue
    },
    {
      title: "Manual Entry",
      description: "Manually enter ingredients to check for allergens",
      icon: "create-outline" as const,
      route: "/(tabs)/manual" as const,
      color: "#8b5cf6", // purple
    },
    {
      title: "Emergency Info",
      description: "Quick access to emergency contacts and information",
      icon: "alert-circle-outline" as const,
      route: "/(tabs)/emergency" as const,
      color: "#ef4444", // red
    },
    {
      title: "Medicine Tracker",
      description: "Track your allergy medications and set reminders",
      icon: "medkit-outline" as const,
      route: "/(tabs)/medicine" as const,
      color: "#10b981", // green
    },
  ];

  return (
    <ScreenContainer>
      {/* Header with welcome message */}
      <View className="mb-6">
        <View className="flex-row items-center justify-between mb-2">
          <View>
            <Text className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Welcome{user ? `, ${user.username}` : ''}
            </Text>
            <Text className="text-gray-600 dark:text-gray-400">
              Your allergy management assistant
            </Text>
          </View>
          <FontAwesome5 name="syringe" size={isIOS ? 32 : 40} color="#3b82f6" />
        </View>
      </View>

      {/* App description card */}
      <Card 
        variant="elevated"
        style={{ marginBottom: 20 }}
      >
        <View className="flex-row items-center">
          <View className="flex-1 pr-4">
            <Text className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
              Allergy Detection App
            </Text>
            <Text className="text-gray-600 dark:text-gray-400">
              Scan product labels, detect allergens, and stay safe with our comprehensive allergy management tools.
            </Text>
          </View>
          <View className="bg-blue-100 dark:bg-blue-900 rounded-full p-3">
            <Ionicons name="shield-checkmark-outline" size={28} color="#3b82f6" />
          </View>
        </View>
      </Card>

      {/* Feature cards */}
      <Text className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">
        Quick Actions
      </Text>
      <View className="flex-row flex-wrap justify-between mb-6">
        {features.map((feature, index) => (
          <TouchableOpacity
            key={index}
            style={{ width: '48%', marginBottom: 12 }}
            onPress={() => router.push(feature.route)}
          >
            <Card variant="outlined" style={{ height: 135 }}>
              <View className="items-center justify-between h-full py-2">
                <View 
                  style={{ backgroundColor: `${feature.color}20` }} 
                  className="rounded-full mb-2"
                >
                  <Ionicons name={feature.icon} size={24} color={feature.color} />
                </View>
                <Text className="text-gray-900 dark:text-gray-100 font-bold text-center">
                  {feature.title}
                </Text>
                <Text className="text-gray-500 dark:text-gray-400 text-center text-xs mt-1 px-1">
                  {feature.description}
                </Text>
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent scans section - placeholder for future functionality */}
      <Text className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3">
        Recent Activity
      </Text>
      <Card variant="outlined" style={{ marginBottom: 20 }}>
        <View className="items-center py-4">
          <Ionicons name="time-outline" size={32} color="#9ca3af" style={{ marginBottom: 8 }} />
          <Text className="text-gray-500 dark:text-gray-400 text-center">
            No recent activity
          </Text>
          <Text className="text-gray-400 dark:text-gray-500 text-center text-xs mt-1">
            Your recent scans and searches will appear here
          </Text>
        </View>
      </Card>

      {/* Account section */}
      <TouchableOpacity
        onPress={logout}
        className="flex-row items-center justify-between bg-red-50 dark:bg-red-900/20 rounded-xl p-4 mt-2"
      >
        <View className="flex-row items-center">
          <Ionicons name="log-out-outline" size={22} color="#ef4444" style={{ marginRight: 8 }} />
          <Text className="text-red-600 dark:text-red-400 font-medium">
            Sign Out
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#ef4444" />
      </TouchableOpacity>
    </ScreenContainer>
  );
}
