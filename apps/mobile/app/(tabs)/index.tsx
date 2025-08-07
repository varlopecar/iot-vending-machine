import { TailwindView, TailwindText } from "../../components/ui";
import { TouchableOpacity } from "react-native";
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
    <TailwindView
      className={`${isDark ? "bg-dark-background" : "bg-light-background"} flex-1 p-4`}
    >
      <TailwindView className="flex-1 justify-center items-center">
        <TailwindText
          className={`${isDark ? "text-dark-text" : "text-light-text"} text-2xl font-bold mb-8`}
        >
          Page : Réserver
        </TailwindText>

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
          <TailwindText
            className={`${isDark ? "text-dark-buttonText" : "text-light-text"} font-semibold`}
          >
            Thème : {getThemeLabel()}
          </TailwindText>
        </TouchableOpacity>
      </TailwindView>
    </TailwindView>
  );
}
