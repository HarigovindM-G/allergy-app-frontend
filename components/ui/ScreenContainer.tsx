// components/ui/ScreenContainer.tsx
import React from "react";
import { View, ViewProps, ScrollView, StyleSheet, SafeAreaView, Platform, StatusBar } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props extends ViewProps {
  children: React.ReactNode;
  padded?: boolean;
  scrollable?: boolean;
}

export default function ScreenContainer({ 
  children, 
  padded = true, 
  scrollable = true,
  ...props 
}: Props) {
  const insets = useSafeAreaInsets();
  const isIOS = Platform.OS === 'ios';
  
  // Calculate padding based on safe area insets
  const topPadding = isIOS ? insets.top : StatusBar.currentHeight || 0;
  
  if (!scrollable) {
    return (
      <View
        style={[
          styles.container,
          { paddingTop: padded ? topPadding + 16 : topPadding }
        ]}
        className={`bg-gray-50 dark:bg-gray-900 ${padded ? 'px-4' : 'px-0'}`}
        {...props}
      >
        {children}
      </View>
    );
  }
  
  return (
    <ScrollView
      {...props}
      style={[
        { flex: 1 },
        { paddingTop: padded ? topPadding : 0 }
      ]}
      contentContainerStyle={[
        styles.scrollContainer,
        padded ? { paddingHorizontal: 16, paddingVertical: 16 } : { paddingHorizontal: 0, paddingVertical: 0 }
      ]}
      className="bg-gray-50 dark:bg-gray-900"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    minHeight: '100%',
  },
});