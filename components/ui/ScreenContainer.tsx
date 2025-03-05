// components/ui/ScreenContainer.tsx
import React from "react";
import { View, ViewProps } from "react-native";

interface Props extends ViewProps {
  children: React.ReactNode;
}

export default function ScreenContainer({ children, ...props }: Props) {
  return (
    <View
      {...props}
      className="flex-1 bg-gray-50 dark:bg-gray-900 px-4 py-6"
    >
      {children}
    </View>
  );
}
