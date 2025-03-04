// app/(auth)/login.tsx
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    try {
      // Example call to your backend's /login endpoint
      const response = await fetch("https://YOUR_BACKEND_URL/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) {
        const data = await response.json(); // e.g. { token: 'JWT' }
        // Store token in AsyncStorage
        await AsyncStorage.setItem("token", data.token);

        // Navigate to main app
        router.replace("/(tabs)");
      } else {
        // handle error (invalid credentials, etc.)
        console.warn("Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <View className="flex-1 bg-white items-center justify-center p-4">
      <Text className="text-2xl font-bold mb-4">Login</Text>
      <TextInput
        className="w-full border rounded px-2 py-1 mb-2"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        className="w-full border rounded px-2 py-1 mb-2"
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        className="bg-blue-500 px-4 py-2 rounded mt-4"
        onPress={handleLogin}
      >
        <Text className="text-white">Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="mt-2"
        onPress={() => router.push("/(auth)/signup")}
      >
        <Text className="text-blue-600">Go to Signup</Text>
      </TouchableOpacity>
    </View>
  );
}
