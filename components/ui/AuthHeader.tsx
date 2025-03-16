import React from 'react';
import { View, Text, Platform } from 'react-native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

interface AuthHeaderProps {
  title: string;
  subtitle: string;
  iconSize?: number;
}

export default function AuthHeader({ 
  title, 
  subtitle, 
  iconSize = 70 
}: AuthHeaderProps) {
  // Adjust sizes based on platform
  const isIOS = Platform.OS === 'ios';
  const adjustedIconSize = isIOS ? (iconSize * 0.8) : iconSize;
  const marginBottom = isIOS ? 10 : 16;
  
  return (
    <View className={`items-center ${isIOS ? 'mb-6' : 'mb-10'}`}>
      <FontAwesome5 
        name="syringe" 
        size={adjustedIconSize} 
        color="#2563eb" 
        style={{ marginBottom: marginBottom }} 
      />
      <Text className={`${isIOS ? 'text-2xl' : 'text-3xl'} font-bold text-gray-900 dark:text-white`}>
        {title}
      </Text>
      <Text className="text-base text-gray-600 dark:text-gray-400 mt-1 text-center">
        {subtitle}
      </Text>
    </View>
  );
} 