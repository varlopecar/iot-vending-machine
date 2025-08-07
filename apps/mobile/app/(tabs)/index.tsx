import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { AuthButton } from '../../components/ui';
import { useTailwindTheme } from '../../hooks/useTailwindTheme';

export default function HomeScreen() {
  const { isDark } = useTailwindTheme();

  const handleLogin = () => {
    router.push('/login');
  };

  const handleRegister = () => {
    router.push('/register');
  };

  return (
    <View className={`flex-1 p-6 ${isDark ? 'bg-dark-primary' : 'bg-light-primary'}`}>
      <View className="flex-1 justify-center items-center">
        <View className="mb-12">
          <Text className={`text-4xl font-bold text-center mb-4 ${
            isDark ? 'text-dark-text' : 'text-light-text'
          }`}>
            Bienvenue !
          </Text>
          <Text className={`text-lg text-center ${
            isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'
          }`}>
            Connectez-vous ou créez un compte pour commencer
          </Text>
        </View>
        
        <View className="w-full space-y-4">
          <AuthButton
            title="Se connecter"
            onPress={handleLogin}
          />
          
          <AuthButton
            title="S'inscrire"
            onPress={handleRegister}
          />
        </View>
      </View>
    </View>
  );
}
