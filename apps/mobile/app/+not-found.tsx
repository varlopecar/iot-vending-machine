import { Link, Stack } from 'expo-router';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTailwindTheme } from '../hooks/useTailwindTheme';

export default function NotFoundScreen() {
  const { isDark } = useTailwindTheme();

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className={`flex-1 items-center justify-center p-5 ${
        isDark ? 'bg-dark-primary' : 'bg-light-primary'
      }`}>
        <Text className={`text-lg mb-4 ${
          isDark ? 'text-dark-text' : 'text-light-text'
        }`}>
          Cette page n&apos;existe pas.
        </Text>
        <Link href="/" asChild>
          <TouchableOpacity className={`px-4 py-3 rounded-lg border-2 ${
            isDark 
              ? 'bg-dark-surface border-dark-border' 
              : 'bg-light-surface border-light-border'
          }`}>
            <Text className={`font-semibold ${
              isDark ? 'text-dark-text' : 'text-light-text'
            }`}>
              Retour à l&apos;accueil
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </>
  );
}
