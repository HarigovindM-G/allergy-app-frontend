// components/ui/ScreenContainer.tsx
import React from "react";
import { View, ViewProps , ScrollView, StyleSheet  } from "react-native";

interface Props extends ViewProps {
  children: React.ReactNode;
}

export default function ScreenContainer({ children, ...props }: Props) {
  return (
    <ScrollView
    {...props}
    style={{ flex: 1 }} // ensures the ScrollView itself is full-height
    contentContainerStyle={styles.container} // extra space at bottom
    className="bg-gray-50 dark:bg-gray-900 px-4 py-6"
  >
    {children}
  </ScrollView>
  
  );
}
const styles = StyleSheet.create({
  container: {
    flexGrow: 1, 
    paddingHorizontal: 8,      // same as "px-4"
    paddingVertical: 8,        // same as "py-6"
    minHeight: "100%",          
  },
});