// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, View } from "react-native";
import { Stack } from "expo-router";
import { useColorScheme } from "react-native";
import { useAuth } from "@/hooks/useAuth";

export default function TabLayout() {
  const { logout } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  
  return (
    <Tabs
    screenOptions={{
      headerStyle: { backgroundColor: isDark ? "#0f172a" : "#fff" },
      headerTintColor: isDark ? "#fff" : "#000",
      headerRight: () => (
        <TouchableOpacity 
          onPress={logout} 
          style={{ marginRight: 15 }}
        >
          <Ionicons 
            name="log-out-outline" 
            size={24} 
            color={isDark ? "#fff" : "#000"} 
          />
        </TouchableOpacity>
      ),
    }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: "Scan",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="camera" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="manual"
        options={{
          title: "Manual",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="create" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="medicine"
        options={{
          title: "Medicine",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="medkit" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="emergency"
        options={{
          title: "Emergency",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="warning" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
