// app/(auth)/signup.tsx
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

export default function SignupScreen() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const { signup } = useAuth();
  const windowHeight = Dimensions.get('window').height;
  const isIOS = Platform.OS === 'ios';

  const handleSignup = async () => {
    // Validate inputs
    if (!email || !username || !password || !confirmPassword) {
      Alert.alert("Missing Information", "Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Password Mismatch", "Passwords do not match. Please try again.");
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      const success = await signup(email, username, password);
      
      if (!success) {
        Alert.alert("Registration Failed", "Username or email may already be in use. Please try different credentials.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      Alert.alert("Connection Error", "Unable to connect to the server. Please check your internet connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
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
            title="Create Account" 
            subtitle="Join us to manage your allergies safely" 
            iconSize={isIOS ? 100 : 60}
          />

          {/* Signup Form */}
          <View className={isIOS ? "space-y-3" : "space-y-4"}>
            <InputField 
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              iconName="mail-outline"
              keyboardType="email-address"
              autoComplete="email"
            />

            <InputField 
              label="Username"
              value={username}
              onChangeText={setUsername}
              placeholder="Choose a username"
              iconName="person-outline"
            />

            <InputField 
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Create a password"
              iconName="lock-closed-outline"
              secureTextEntry={!showPassword}
              showToggle={true}
              toggleSecureEntry={togglePasswordVisibility}
            />

            <InputField 
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm your password"
              iconName="shield-checkmark-outline"
              secureTextEntry={!showConfirmPassword}
              showToggle={true}
              toggleSecureEntry={toggleConfirmPasswordVisibility}
            />

            <View className={isIOS ? "mt-3" : "mt-4"}>
              <Button 
                title="Create Account"
                onPress={handleSignup}
                isLoading={isLoading}
                disabled={isLoading}
              />
            </View>

            <View className="flex-row justify-center mt-3">
              <Text className="text-gray-600 dark:text-gray-400">
                Already have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
                <Text className="text-blue-600 font-semibold">Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
