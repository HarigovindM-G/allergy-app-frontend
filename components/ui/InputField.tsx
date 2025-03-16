import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  iconName: any; // Ionicons name
  secureTextEntry?: boolean;
  toggleSecureEntry?: () => void;
  showToggle?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: string;
}

export default function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  iconName,
  secureTextEntry = false,
  toggleSecureEntry,
  showToggle = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoComplete,
}: InputFieldProps) {
  // Adjust padding based on platform
  const isIOS = Platform.OS === 'ios';
  
  return (
    <View className="mb-2">
      <Text className={`text-sm font-medium text-gray-700 dark:text-gray-300 ${isIOS ? 'mb-1' : 'mb-2'} ml-1`}>
        {label}
      </Text>
      <View className={`flex-row items-center border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 ${isIOS ? 'px-3 py-2' : 'px-4 py-3'}`}>
        <Ionicons name={iconName} size={isIOS ? 18 : 20} color="#6b7280" />
        <TextInput
          className="flex-1 ml-2 text-gray-900 dark:text-white"
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          style={{ fontSize: isIOS ? 15 : 16 }}
        />
        {showToggle && toggleSecureEntry && (
          <TouchableOpacity onPress={toggleSecureEntry}>
            <Ionicons 
              name={secureTextEntry ? "eye-outline" : "eye-off-outline"} 
              size={isIOS ? 18 : 20} 
              color="#6b7280" 
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
} 