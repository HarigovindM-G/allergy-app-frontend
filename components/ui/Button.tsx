import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ButtonProps {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  iconName?: any; // Ionicons name
  fullWidth?: boolean;
}

export default function Button({
  title,
  onPress,
  isLoading = false,
  disabled = false,
  variant = 'primary',
  iconName,
  fullWidth = true,
}: ButtonProps) {
  // Adjust padding based on platform
  const isIOS = Platform.OS === 'ios';
  
  // Style classes based on variant
  const getButtonClasses = () => {
    const baseClasses = isIOS ? "rounded-xl py-3 items-center shadow-md" : "rounded-xl py-4 items-center shadow-md";
    const widthClass = fullWidth ? "w-full" : "";
    
    switch (variant) {
      case 'primary':
        return `${baseClasses} ${widthClass} bg-blue-600`;
      case 'secondary':
        return `${baseClasses} ${widthClass} bg-gray-600`;
      case 'outline':
        return `${baseClasses} ${widthClass} bg-transparent border border-blue-600`;
      default:
        return `${baseClasses} ${widthClass} bg-blue-600`;
    }
  };

  const getTextClasses = () => {
    switch (variant) {
      case 'outline':
        return `text-blue-600 font-semibold ${isIOS ? 'text-sm' : 'text-base'}`;
      default:
        return `text-white font-semibold ${isIOS ? 'text-sm' : 'text-base'}`;
    }
  };

  return (
    <TouchableOpacity
      className={getButtonClasses()}
      onPress={onPress}
      disabled={isLoading || disabled}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'outline' ? "#2563eb" : "white"} />
      ) : (
        <Text className={getTextClasses()}>
          {iconName && (
            <Ionicons 
              name={iconName} 
              size={isIOS ? 16 : 18} 
              color={variant === 'outline' ? "#2563eb" : "white"} 
            />
          )}
          {" "}{title}
        </Text>
      )}
    </TouchableOpacity>
  );
} 