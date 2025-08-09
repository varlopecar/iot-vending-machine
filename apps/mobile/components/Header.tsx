import React, { useState, useEffect } from "react";
import { View, Text, Animated } from "react-native";
import { useTailwindTheme } from "../hooks/useTailwindTheme";

interface HeaderProps {
  title: string;
  scrollY?: Animated.Value;
  showTitleThreshold?: number; // À partir de quel scroll afficher le titre
}

export function Header({
  title,
  scrollY,
  showTitleThreshold = 100,
}: HeaderProps) {
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
    <View
      className={`${
        isDark ? "bg-dark-background" : "bg-light-background"
      } pt-2 pb-4 px-4`}
      style={{
        justifyContent: "center",
        minHeight: 50,
      }}
    >
      {showTitle && (
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
          <Text
            className={`${
              isDark ? "text-dark-text" : "text-light-text"
            } text-lg font-semibold`}
          >
            {title}
          </Text>
        </View>
      )}
    </View>
  );
}
