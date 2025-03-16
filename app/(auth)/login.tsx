// app/(auth)/login.tsx
import React, { useState } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { StatusBar } from "expo-status-bar";
import AuthHeader from "@/components/ui/AuthHeader";
import InputField from "@/components/ui/InputField";
import Button from "@/components/ui/Button";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { login } = useAuth();
  const windowHeight = Dimensions.get('window').height;
  const isIOS = Platform.OS === 'ios';

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Missing Information", "Please enter both username/email and password");
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(username, password);
      
      if (!success) {
        Alert.alert("Authentication Failed", "Invalid username or password. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Connection Error", "Unable to connect to the server. Please check your internet connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <StatusBar style="dark" />
      <ScrollView 
        contentContainerStyle={{ 
          flexGrow: 1, 
          justifyContent: 'center',
          minHeight: windowHeight
        }}
        className="bg-white dark:bg-gray-900"
      >
        <View className={`px-6 ${isIOS ? 'py-6' : 'py-12'} w-full max-w-md mx-auto`}>
          {/* Logo and App Name */}
          <AuthHeader 
            title="Allergy Detection" 
            subtitle="Scan, detect, and stay safe from allergens" 
            iconSize={isIOS ? 100 : 60}
          />

          {/* Login Form */}
          <View className={isIOS ? "space-y-4" : "space-y-6"}>
            <InputField 
              label="Username or Email"
              value={username}
              onChangeText={setUsername}
              placeholder="Enter your username or email"
              iconName="person-outline"
              autoComplete="email"
            />

            <InputField 
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              iconName="lock-closed-outline"
              secureTextEntry={!showPassword}
              showToggle={true}
              toggleSecureEntry={togglePasswordVisibility}
            />

            <View className={isIOS ? "mt-4" : "mt-2"}>
              <Button 
                title="Sign In"
                onPress={handleLogin}
                isLoading={isLoading}
                disabled={isLoading}
              />
            </View>

            <View className="flex-row justify-center mt-4">
              <Text className="text-gray-600 dark:text-gray-400">
                Don't have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
                <Text className="text-blue-600 font-semibold">Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
