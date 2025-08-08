import React from "react";
import { Text, TextProps } from "react-native";

interface SectionTitleProps extends TextProps {
  isDark: boolean;
  children: React.ReactNode;
}

export function SectionTitle({
  isDark,
  children,
  style,
  ...rest
}: SectionTitleProps) {
  return (
    <Text
      {...rest}
      style={style}
      className={`${isDark ? "text-dark-text" : "text-light-text"} text-5xl font-bold mb-6 px-4`}
    >
      {children}
    </Text>
  );
}
