import { View, Text } from "react-native";
import { useTailwindTheme } from "../../hooks/useTailwindTheme";

export default function FideliteScreen() {
  const { isDark } = useTailwindTheme();

  return (
    <View
      className={`${isDark ? "bg-dark-background" : "bg-light-background"} flex-1 p-4`}
    >
      <View className="flex-1 justify-center items-center">
        <Text
          className={`${isDark ? "text-dark-text" : "text-light-text"} text-2xl font-bold`}
        >
          Page : Fidélité
        </Text>
      </View>
    </View>
  );
}
