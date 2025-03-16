import React from 'react';
import { View, Text, ViewStyle, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  icon?: any; // Ionicons name
  style?: ViewStyle;
  onPress?: () => void;
  footer?: React.ReactNode;
  variant?: 'default' | 'outlined' | 'elevated';
}

export default function Card({
  children,
  title,
  icon,
  style,
  onPress,
  footer,
  variant = 'default',
}: CardProps) {
  const CardContainer = onPress ? TouchableOpacity : View;
  
  const getContainerStyle = () => {
    switch (variant) {
      case 'outlined':
        return 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl';
      case 'elevated':
        return 'bg-white dark:bg-gray-800 rounded-xl shadow-md';
      default:
        return 'bg-white dark:bg-gray-800 rounded-xl';
    }
  };
  
  return (
    <CardContainer 
      style={style}
      className={getContainerStyle()}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {/* Card Header */}
      {title && (
        <View className="flex-row items-center p-4 border-b border-gray-100 dark:border-gray-700">
          {icon && (
            <Ionicons 
              name={icon} 
              size={20} 
              color="#3b82f6" 
              style={{ marginRight: 8 }}
            />
          )}
          <Text className="text-gray-900 dark:text-gray-100 font-bold text-lg">
            {title}
          </Text>
        </View>
      )}
      
      {/* Card Content */}
      <View className={title ? 'p-4' : 'p-4'}>
        {children}
      </View>
      
      {/* Card Footer */}
      {footer && (
        <View className="px-4 py-3 border-t border-gray-100 dark:border-gray-700">
          {footer}
        </View>
      )}
    </CardContainer>
  );
} 