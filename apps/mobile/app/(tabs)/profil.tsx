import React from "react";
import { View, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTailwindTheme } from "../../hooks/useTailwindTheme";
import {
  ProfileAvatar,
  UserInfo,
  ActionButton,
  TabBarSpacer,
} from "../../components/ui";
import { useAuth } from "../../contexts/AuthContext";

export default function ProfilScreen() {
  const { isDark } = useTailwindTheme();
  const router = useRouter();
  const { user } = useAuth();

  const handleEditPassword = () => {
    Alert.alert("Modifier le mot de passe", "Fonctionnalité à implémenter", [
      { text: "OK" },
    ]);
  };

  const handleSettingsPress = () => {
    router.push("/parametres");
  };

  return (
    <SafeAreaView
      className={`${isDark ? "bg-dark-background" : "bg-light-background"} flex-1`}
    >
      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Header avec avatar et bouton paramètres */}
        <View className="items-center mt-6 mb-8">
          <ProfileAvatar
            imageUri={require("../../assets/images/test.png")}
            size="large"
            showSettingsIcon={true}
            onSettingsPress={handleSettingsPress}
          />
        </View>

        {/* Informations utilisateur */}
        <View className="items-center">
          <UserInfo name={user?.full_name || "Utilisateur"} email={user?.email || ""} showDivider={true} />
        </View>

        {/* Bouton modifier mot de passe */}
        <View className="mb-8 items-start">
          <ActionButton
            onPress={handleEditPassword}
            variant="outline"
            size="medium"
            isDark={isDark}
          >
            Edit Password
          </ActionButton>
        </View>
      </ScrollView>

      <TabBarSpacer />
    </SafeAreaView>
  );
}
