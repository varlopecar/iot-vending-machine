import React, { useState } from "react";
import {
  Text,
  TextStyle,
  StyleProp,
  View,
  LayoutChangeEvent,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";

interface GradientTextProps {
  children: string;
  style?: StyleProp<TextStyle>;
  colors: string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
}

export function GradientText({
  children,
  style,
  colors,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 0 },
}: GradientTextProps) {
  const [{ width, height }, setSize] = useState({ width: 0, height: 0 });

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    // Évite les setState en boucle : on ne set que si ça change
    setSize((s) =>
      s.width !== width || s.height !== height ? { width, height } : s
    );
  };

  // Fallback si couleurs invalides
  if (!Array.isArray(colors) || colors.length < 2) {
    return <Text style={style}>{children}</Text>;
  }

  if (width === 0 || height === 0) {
    return (
      <View style={{ alignSelf: "flex-start" }}>
        <Text style={style as any} onLayout={onLayout}>
          {children}
        </Text>
      </View>
    );
  }

  return (
    <MaskedView
      style={{ width, height }}
      androidRenderingMode="software"
      maskElement={
        <View style={{ backgroundColor: "transparent" }} collapsable={false}>
          <Text style={[style as any, { color: "black" }]} onLayout={onLayout}>
            {children}
          </Text>
        </View>
      }
    >
      <LinearGradient
        colors={colors as [string, string, ...string[]]}
        start={start}
        end={end}
        style={{ width, height }}
      />
    </MaskedView>
  );
}
