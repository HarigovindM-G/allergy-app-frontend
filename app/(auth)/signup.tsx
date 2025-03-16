// app/(auth)/signup.tsx
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/useAuth";

export default function SignupScreen() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { signup } = useAuth();

  const handleSignup = async () => {
    // Validate inputs
    if (!email || !username || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      const success = await signup(email, username, password);
      
      if (!success) {
        Alert.alert("Signup Failed", "Username or email may already be in use");
      }
    } catch (error) {
      console.error("Signup error:", error);
      Alert.alert("Error", "An error occurred during signup");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white items-center justify-center p-4">
      <Text className="text-2xl font-bold mb-4">Sign Up</Text>
      
      <TextInput
        className="w-full border rounded px-4 py-2 mb-4"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        className="w-full border rounded px-4 py-2 mb-4"
        placeholder="Username"
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
      
      <TextInput
        className="w-full border rounded px-4 py-2 mb-4"
        placeholder="Confirm Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <TouchableOpacity
        className="bg-blue-500 w-full px-4 py-3 rounded mt-4 items-center"
        onPress={handleSignup}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-semibold">Sign Up</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        className="mt-4"
        onPress={() => router.push("/(auth)/login")}
      >
        <Text className="text-blue-600">Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
}
