// app/(auth)/signup.tsx
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export default function SignupScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSignup = async () => {
    try {
      const response = await fetch("https://YOUR_BACKEND_URL/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) {
        // Typically we'd get a token or user ID back
        const data = await response.json();
        await AsyncStorage.setItem("token", data.token);

        // Then navigate to main app
        router.replace("/(tabs)");
      } else {
        console.warn("Signup failed");
      }
    } catch (error) {
      console.error("Signup error:", error);
    }
  };

  return (
    <View className="flex-1 bg-white items-center justify-center p-4">
      <Text className="text-2xl font-bold mb-4">Sign Up</Text>
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
        onPress={handleSignup}
      >
        <Text className="text-white">Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="mt-2"
        onPress={() => router.push("/(auth)/login")}
      >
        <Text className="text-blue-600">Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
}
