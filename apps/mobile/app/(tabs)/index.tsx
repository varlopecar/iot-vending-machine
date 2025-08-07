import { TouchableOpacity, View, Text } from "react-native";
import { useTailwindTheme } from "../../hooks/useTailwindTheme";

export default function IndexScreen() {
  const { theme, setTheme, isDark } = useTailwindTheme();

  const toggleTheme = () => {
    if (theme === "system") {
      setTheme("light");
    } else if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("system");
    }
  };

  const getThemeLabel = () => {
    if (theme === "system") return "Système";
    return theme === "dark" ? "Sombre" : "Clair";
  };

  return (
    <View
      className={`${isDark ? "bg-dark-background" : "bg-light-background"} flex-1 p-4`}
    >
      <View className="flex-1 justify-center items-center">
        <Text
          className={`${isDark ? "text-dark-text" : "text-light-text"} text-2xl font-bold mb-8`}
        >
          Page : Réserver
        </Text>

        <TouchableOpacity
          onPress={toggleTheme}
          style={{
            backgroundColor: isDark ? "#2C2221" : "#F9F4EC",
            paddingHorizontal: 24,
            paddingVertical: 30,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: isDark ? "#493837" : "#F3E9D8",
          }}
        >
          <Text>Thème : {getThemeLabel()}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
