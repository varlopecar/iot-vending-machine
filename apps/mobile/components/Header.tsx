import React, { useState, useEffect } from "react";
import { View, Text, Animated } from "react-native";
import { useTailwindTheme } from "../hooks/useTailwindTheme";

interface HeaderProps {
  title?: string;
  customTitle?: React.ReactNode;
  scrollY?: Animated.Value;
  showTitleThreshold?: number; // À partir de quel scroll afficher le titre
}

export function Header({ title, customTitle, scrollY, showTitleThreshold = 100 }: HeaderProps) {
  const { isDark } = useTailwindTheme();
  const [showTitle, setShowTitle] = useState(false);

  useEffect(() => {
    if (scrollY) {
      const listener = scrollY.addListener(({ value }) => {
        setShowTitle(value > showTitleThreshold);
      });

      return () => scrollY.removeListener(listener);
    }
  }, [scrollY, showTitleThreshold]);

  return (
    <View className={`${isDark ? "bg-dark-background" : "bg-light-background"} pb-1`} style={{ justifyContent: "center", minHeight: 20 }}>
      {customTitle ? (
        <View style={{ paddingHorizontal: 16, paddingTop: 2 }}>{customTitle}</View>
      ) : (
        showTitle && title ? (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text className={`${isDark ? "text-dark-text" : "text-light-text"} text-lg font-semibold`}>{title}</Text>
          </View>
        ) : null
      )}
    </View>
  );
}
