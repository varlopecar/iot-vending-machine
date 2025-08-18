import React, { useState } from "react";
import { View, ScrollView, Text, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useTailwindTheme } from "../hooks/useTailwindTheme";
import { AuthInput, AuthButton, VendingIllustration } from "../components/ui";
import { useAuth } from "../contexts/AuthContext";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { isDark } = useTailwindTheme();
  const { login, error: authError, clearError } = useAuth();

  const validate = () => {
    let valid = true;
    setEmailError(null);
    setPasswordError(null);
    setSubmitError(null);
    clearError();

    if (!email) {
      setEmailError("L'email est requis");
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Email invalide");
      valid = false;
    }

    if (!password) {
      setPasswordError("Le mot de passe est requis");
      valid = false;
    }

    return valid;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    try {
      await login(email, password);
      router.replace("/(tabs)");
    } catch (e: any) {
      setSubmitError(e?.message || authError || "Échec de la connexion");
    }
  };

  const handleSignUp = () => {
    router.push("/register");
  };

  const handleForgotPassword = () => {


  };

  return (
    <SafeAreaView
      className={`flex-1 ${isDark ? "bg-dark-primary" : "bg-light-primary"}`}
    >
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
          <Text
            className={`text-5xl font-bold text-center mb-8 ${
              isDark ? "text-dark-text" : "text-light-text"
            }`}
          >
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
              errorText={emailError}
            />

            <AuthInput
              placeholder="Mot de passe*"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              errorText={passwordError}
            />

            {!!submitError && (
              <Text className="text-red-500 text-center mb-4">{submitError}</Text>
            )}
            {/* Lien mot de passe oublié */}
            <TouchableOpacity onPress={handleForgotPassword} className="mb-6">
              <Text
                className={`text-center ${
                  isDark ? "text-dark-secondary" : "text-light-secondary"
                }`}
              >
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
              <Text
                className={`${
                  isDark
                    ? "text-dark-textSecondary"
                    : "text-light-textSecondary"
                }`}
              >
                Pas encore de compte ?{" "}
              </Text>
              <TouchableOpacity onPress={handleSignUp}>
                <Text
                  className={`font-bold underline ${
                    isDark ? "text-dark-secondary" : "text-light-secondary"
                  }`}
                >
                  S&apos;inscrire
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
