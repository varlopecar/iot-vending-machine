import React, { useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTailwindTheme } from '../hooks/useTailwindTheme';
import { AuthInput, AuthButton, VendingIllustration } from '../components/ui';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { isDark } = useTailwindTheme();

  const handleRegister = () => {
    console.log('Tentative d\'inscription:', { email, password, confirmPassword });
    
    if (password !== confirmPassword) {
      console.log('Les mots de passe ne correspondent pas');
      return;
    }
    
    router.replace('/(tabs)');
  };

  const handleLogin = () => {
    router.push('/login');
  };

  const isFormValid = email && password && confirmPassword && password === confirmPassword;

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

            <AuthInput
              placeholder="Mot de passe*"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            {/* Bouton d'inscription */}
            <AuthButton
              title="Inscription"
              onPress={handleRegister}
              disabled={!isFormValid}
            />

            {/* Lien de connexion */}
            <View className="flex-row justify-center items-center">
              <Text className={`${
                isDark ? 'text-dark-textSecondary' : 'text-light-textSecondary'
              }`}>
                Vous avez déjà un compte ?{' '}
              </Text>
              <TouchableOpacity onPress={handleLogin}>
                <Text className={`font-bold underline ${
                  isDark ? 'text-dark-secondary' : 'text-light-secondary'
                }`}>
                  Se connecter
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
