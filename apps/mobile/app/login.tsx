import React, { useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTailwindTheme } from '../hooks/useTailwindTheme';
import { AuthInput, AuthButton, VendingIllustration } from '../components/ui';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { isDark } = useTailwindTheme();

  const handleLogin = () => {
    console.log('Tentative de connexion:', { email, password });
    router.replace('/(tabs)');
  };

  const handleSignUp = () => {
    router.push('/register');
  };

  const handleForgotPassword = () => {
    console.log('Mot de passe oublié');
    // TODO: Implémenter la logique de récupération de mot de passe
  };

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-dark-primary' : 'bg-light-primary'}`}>
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className="flex-1 px-6 pt-6">
          {/* Titre de l'application */}
          <Text className={`text-5xl font-bold text-center mb-8 ${
            isDark ? 'text-dark-text' : 'text-light-text'
          }`}>
            AppName
          </Text>

          {/* Illustration du distributeur */}
          <VendingIllustration className="mb-8" />

          {/* Formulaire */}
          <View className="flex-1">
            <AuthInput
              placeholder="Email*"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            <AuthInput
              placeholder="Mot de passe*"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            {/* Lien mot de passe oublié */}
            <TouchableOpacity 
              onPress={handleForgotPassword}
              className="mb-6"
            >
              <Text className={`text-center ${
                isDark ? 'text-dark-secondary' : 'text-light-secondary'
              }`}>
                Mot de passe oublié ?
              </Text>
            </TouchableOpacity>

            {/* Bouton de connexion */}
            <AuthButton
              title="Connexion"
              onPress={handleLogin}
              disabled={!email || !password}
            />

            {/* Lien d'inscription */}
            <View className="flex-row justify-center items-center">
              <Text className={`${
                isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'
              }`}>
                Pas encore de compte ?{' '}
              </Text>
              <TouchableOpacity onPress={handleSignUp}>
                <Text className={`font-bold underline ${
                  isDark ? 'text-dark-secondary' : 'text-light-secondary'
                }`}>
                  S'inscrire
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
