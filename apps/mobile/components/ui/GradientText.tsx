import React from "react";
import { Text, TextStyle, StyleProp, View } from "react-native";
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
  return (
    <View className="flex-1 justify-center items-start bg-transparent">
      <MaskedView
        maskElement={
          <Text style={[style, { color: "black" }]}>{children}</Text>
        }
      >
        <LinearGradient
          colors={colors as [string, string, ...string[]]}
          start={start}
          end={end}
          style={{
            flex: 1,
            alignSelf: "stretch", // 👈 permet au gradient de suivre la largeur du texte
          }}
        >
          <Text style={[style, { opacity: 0 }]}>{children}</Text>
        </LinearGradient>
      </MaskedView>
    </View>
  );
}
