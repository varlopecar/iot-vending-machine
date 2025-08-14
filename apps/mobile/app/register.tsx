import React, { useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTailwindTheme } from '../hooks/useTailwindTheme';
import { AuthInput, AuthButton, VendingIllustration } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullNameError, setFullNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { isDark } = useTailwindTheme();
  const { register, error: authError, clearError } = useAuth();

  const validate = () => {
    let valid = true;
    setFullNameError(null);
    setEmailError(null);
    setPasswordError(null);
    setConfirmError(null);
    setSubmitError(null);
    clearError();

    if (!fullName.trim()) {
      setFullNameError('Le nom complet est requis');
      valid = false;
    }

    if (!email) {
      setEmailError("L'email est requis");
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Email invalide');
      valid = false;
    }

    if (!password) {
      setPasswordError('Le mot de passe est requis');
      valid = false;
    } else if (password.length < 6) {
      setPasswordError('Le mot de passe doit comporter au moins 6 caractères');
      valid = false;
    }

    if (confirmPassword !== password) {
      setConfirmError('Les mots de passe ne correspondent pas');
      valid = false;
    }

    return valid;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    try {
      await register(fullName.trim(), email, password);
      router.replace('/(tabs)');
    } catch (e: any) {
      setSubmitError(e?.message || authError || "Inscription impossible");
    }
  };

  const handleLogin = () => {
    router.push('/login');
  };

  const isFormValid = !!fullName && email && password && confirmPassword && password === confirmPassword;

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-dark-primary' : 'bg-light-primary'}`}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
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
              placeholder="Nom complet*"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize='words'
              errorText={fullNameError}
            />
            <AuthInput
              placeholder="Email*"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              errorText={emailError}
            />

            <AuthInput
              placeholder="Mot de passe*"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              errorText={passwordError}
            />

            <AuthInput
              placeholder="Confirmer le mot de passe*"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              errorText={confirmError}
            />

            {!!submitError && (
              <Text className="text-red-500 text-center mb-4">{submitError}</Text>
            )}
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
