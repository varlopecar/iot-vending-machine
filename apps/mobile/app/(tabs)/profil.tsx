import React, { useState } from 'react';
import { View, ScrollView, Alert, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTailwindTheme } from '../../hooks/useTailwindTheme';
import {
  ProfileAvatar,
  UserInfo,
  ActionButton,
  IdentifierCard,
  TabBarSpacer
} from '../../components/ui';

export default function ProfilScreen() {
  const { isDark } = useTailwindTheme();
  const router = useRouter();
  const [user] = useState({
    name: 'Sabrina Carpenter',
    email: 'sabrina.carpenter@ynov.com',
    identifier: '7026 8349 75324',
    avatarUri: require('../../assets/images/test.png')
  });

  const handleEditPassword = () => {
    Alert.alert(
      'Modifier le mot de passe',
      'Fonctionnalité à implémenter',
      [{ text: 'OK' }]
    );
  };

  const handleSettingsPress = () => {
    router.push('/parametres');
  };

  const handleCopyIdentifier = () => {
    Alert.alert(
      'Identifiant copié',
      'Votre identifiant a été copié dans le presse-papiers',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView
      className={`${isDark ? 'bg-dark-background' : 'bg-light-background'} flex-1`}
    >
      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Header avec avatar et bouton paramètres */}
        <View className="items-center mt-6 mb-8">
          <ProfileAvatar
            imageUri={user.avatarUri}
            size="large"
            showSettingsIcon={true}
            onSettingsPress={handleSettingsPress}
          />
        </View>

        {/* Informations utilisateur */}
        <View className="items-center">
          <UserInfo
            name={user.name}
            email={user.email}
            showDivider={true}
          />
        </View>

        {/* Bouton modifier mot de passe */}
        <View className="mb-8 items-start">
          <ActionButton
            title="Edit Password"
            onPress={handleEditPassword}
            variant="outline"
            size="medium"
          />
        </View>

        {/* Section identifiant */}
        <View className="mb-6">
          <View className="mb-3">
            <Text
              className={`${isDark ? 'text-dark-text' : 'text-light-text'} text-lg font-bold ml-1`}
            >
              Votre Identifiant
            </Text>
          </View>
          
          <IdentifierCard
            identifier={user.identifier}
            onCopy={handleCopyIdentifier}
            showCopyButton={true}
          />
        </View>
      </ScrollView>
      
      <TabBarSpacer />
    </SafeAreaView>
  );
}
