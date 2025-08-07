import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useTailwindTheme } from "../hooks/useTailwindTheme";

interface TabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

export default function CustomTabBar({
  state,
  descriptors,
  navigation,
}: TabBarProps) {
  const { isDark } = useTailwindTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#332B2C" : "#F9F4EC" },
      ]}
    >
      <View style={styles.tabsWrapper}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tab}
              activeOpacity={0.4}
            >
              <View
                style={[styles.tabContent, isFocused && [styles.activeTab]]}
              >
                {options.tabBarIcon &&
                  options.tabBarIcon({
                    focused: isFocused,
                    color: isFocused
                      ? isDark
                        ? "#FECDEC"
                        : "#5B715F"
                      : "#B3B3B3",
                  })}
                <Text
                  style={[
                    styles.label,
                    {
                      color: isFocused
                        ? isDark
                          ? "#FFFFFF"
                          : "#000000"
                        : "#B3B3B3",
                      fontWeight: isFocused ? "800" : "400",
                    },
                  ]}
                >
                  {options.title}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 90,
    paddingBottom: 30,
    paddingTop: 10,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 0,
    shadowOpacity: 0,
    borderTopWidth: 0.2,
    borderTopColor: "#666666",
  },
  tabsWrapper: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    width: "100%",
  },
  tab: {
    justifyContent: "center",
    alignItems: "center",
    width: "20%",
  },
  tabContent: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    width: "100%",
  },
  activeTab: {
    borderRadius: 20,
  },
  icon: {
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
});
