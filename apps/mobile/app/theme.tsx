import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Theme, useTailwindTheme, lightTheme, darkTheme } from '../hooks/useTailwindTheme';

type ThemeOption = {
  key: Theme;
  title: string;
  previewColors: {
    background: string;
    surface: string;
  };
  split?: boolean;
};

export default function ThemeScreen() {
  const { isDark, currentTheme, setTheme } = useTailwindTheme();
  const [selected, setSelected] = useState<Theme>(currentTheme);

  useEffect(() => {
    setSelected(currentTheme);
  }, [currentTheme]);

  const options: ThemeOption[] = [
    {
      key: 'light',
      title: 'Clair',
      previewColors: { background: lightTheme.background, surface: lightTheme.surface },
    },
    {
      key: 'dark',
      title: 'Sombre',
      previewColors: { background: darkTheme.background, surface: darkTheme.surface },
    },
    {
      key: 'system',
      title: 'Système',
      previewColors: { background: lightTheme.background, surface: lightTheme.surface },
      split: true,
    },
  ];

  const onSelect = async (key: Theme) => {
    setSelected(key);
    await setTheme(key);
  };

  const PhonePreview = ({ colors }: { colors: { background: string; surface: string } }) => (
    <View
      style={{ backgroundColor: colors.background, borderColor: isDark ? '#493837' : '#E3E8E4' }}
      className="w-28 h-44 rounded-2xl border items-center justify-center"
    >
      <View style={{ backgroundColor: colors.surface }} className="w-20 h-6 rounded-md mb-2 opacity-70" />
      <View style={{ backgroundColor: colors.surface }} className="w-24 h-12 rounded-md mb-2 opacity-70" />
      <View style={{ backgroundColor: colors.surface }} className="w-24 h-12 rounded-md opacity-70" />
    </View>
  );

  const PhonePreviewSplit = () => (
    <View
      style={{ borderColor: isDark ? '#493837' : '#E3E8E4' }}
      className="w-28 h-44 rounded-2xl border overflow-hidden"
    >
      <View className="absolute inset-0 flex-row">
        <View style={{ backgroundColor: lightTheme.background }} className="w-1/2 h-full" />
        <View style={{ backgroundColor: darkTheme.background }} className="w-1/2 h-full" />
      </View>
      {/* UI de prévisualisation côté clair */}
      <View className="absolute left-2 top-4 items-center">
        <View style={{ backgroundColor: lightTheme.surface }} className="w-20 h-6 rounded-md mb-2 opacity-70" />
        <View style={{ backgroundColor: lightTheme.surface }} className="w-24 h-12 rounded-md mb-2 opacity-70" />
        <View style={{ backgroundColor: lightTheme.surface }} className="w-24 h-12 rounded-md opacity-70" />
      </View>
      {/* UI de prévisualisation côté sombre */}
      <View className="absolute right-2 top-4 items-center">
        <View style={{ backgroundColor: darkTheme.surface }} className="w-20 h-6 rounded-md mb-2 opacity-60" />
        <View style={{ backgroundColor: darkTheme.surface }} className="w-24 h-12 rounded-md mb-2 opacity-60" />
        <View style={{ backgroundColor: darkTheme.surface }} className="w-24 h-12 rounded-md opacity-60" />
      </View>
    </View>
  );

  const ThemeCard = ({ option }: { option: ThemeOption }) => {
    const isSelected = selected === option.key;
    return (
      <TouchableOpacity
        onPress={() => onSelect(option.key)}
        activeOpacity={0.8}
        className="items-center"
      >
        {option.split ? (
          <PhonePreviewSplit />
        ) : (
          <PhonePreview colors={option.previewColors} />
        )}
        <Text className={`${isDark ? 'text-dark-text' : 'text-light-text'} mt-3 text-base`}>{option.title}</Text>
        <Ionicons
          name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
          size={24}
          color={isSelected ? (isDark ? '#FD9BD9' : '#5B715F') : (isDark ? '#FD9BD9' : '#5B715F')}
          style={{ marginTop: 6 }}
        />
      </TouchableOpacity>
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Gestion du thème de l'application",
          headerBackTitle: '',
          headerStyle: {
            backgroundColor: isDark ? '#493837' : '#E3E8E4',
          },
          headerTintColor: isDark ? '#FEFCFA' : '#3A2E2C',
          headerTitleStyle: { fontWeight: '600', fontSize: 18 },
        }}
      />

      <View className={`${isDark ? 'bg-dark-background' : 'bg-light-background'} flex-1 px-5 pt-6`}>
        <Text className={`${isDark ? 'text-dark-text' : 'text-light-text'} text-2xl font-bold mb-6`}>
          Choisissez un thème
        </Text>

        <View className="flex-row items-start justify-between">
          {options.map((option) => (
            <ThemeCard key={option.key} option={option} />
          ))}
        </View>
      </View>
    </>
  );
}


