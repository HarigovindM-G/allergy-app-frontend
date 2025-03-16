// app/(auth)/login.tsx
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/useAuth";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Please enter both username/email and password");
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(username, password);
      
      if (!success) {
        Alert.alert("Login Failed", "Invalid username or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Error", "An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white items-center justify-center p-4">
      <Text className="text-2xl font-bold mb-4">Login</Text>
      <TextInput
        className="w-full border rounded px-4 py-2 mb-4"
        placeholder="Username or Email"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        className="w-full border rounded px-4 py-2 mb-4"
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        className="bg-blue-500 w-full px-4 py-3 rounded mt-4 items-center"
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-semibold">Login</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        className="mt-4"
        onPress={() => router.push("/(auth)/signup")}
      >
        <Text className="text-blue-600">Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}
