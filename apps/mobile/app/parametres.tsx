import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useTailwindTheme } from '../hooks/useTailwindTheme';
import {
  SettingsSection,
  SettingsItem
  // TabBarSpacer // Unused
} from '../components/ui';

export default function ParametresScreen() {
  const { isDark, currentTheme } = useTailwindTheme();
  const router = useRouter();

  const [settings, setSettings] = useState({
    language: 'Français',
    pushNotifications: true,
  });

  // Synchroniser l'état local avec le thème global (placeholder si besoin plus tard)
  useEffect(() => { }, [currentTheme]);

  const handleOpenThemeSettings = () => {
    router.push('/theme' as any);
  };

  const handleLanguageSelect = () => {
    Alert.alert(
      'Sélectionner la langue',
      'Fonctionnalité à implémenter',
      [{ text: 'OK' }]
    );
  };

  const handlePushNotificationsToggle = async (value: boolean) => {
    setSettings(prev => ({ ...prev, pushNotifications: value }));

    if (value) {
      try {
        // Demander les permissions
        const { status } = await Notifications.requestPermissionsAsync();

        if (status === 'granted') {
          // Envoyer une notification de test immédiate
          await Notifications.scheduleNotificationAsync({
            content: {
              title: '🔔 Notifications activées',
              body: 'Vos notifications push sont maintenant activées !',
              data: { type: 'test' },
            },
            trigger: null, // Notification immédiate
          });

          Alert.alert(
            'Notifications activées',
            'Une notification de test a été envoyée. Vos notifications push sont maintenant actives !',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert(
            'Permission refusée',
            'Les notifications ne peuvent pas être activées sans permission.',
            [{ text: 'OK' }]
          );
          // Remettre le toggle à false si la permission est refusée
          setSettings(prev => ({ ...prev, pushNotifications: false }));
        }
      } catch {
        Alert.alert(
          'Erreur',
          'Impossible d\'activer les notifications.',
          [{ text: 'OK' }]
        );
        // Remettre le toggle à false en cas d'erreur
        setSettings(prev => ({ ...prev, pushNotifications: false }));
      }
    }
  };

  const themeLabel = currentTheme === 'light' ? 'Clair' : currentTheme === 'dark' ? 'Sombre' : 'Système';

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Paramètres',
          headerBackTitle: '',
          headerStyle: {
            backgroundColor: isDark ? '#493837' : '#E3E8E4',
          },
          headerTintColor: isDark ? '#FEFCFA' : '#3A2E2C',
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
          },
        }}
      />
      <View className={`${isDark ? 'bg-dark-background' : 'bg-light-background'} flex-1`}>
        <ScrollView
          className="flex-1 px-4 mt-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          {/* Section Général */}
          <SettingsSection title="Général" marginTop={false}>
            <SettingsItem
              title="Thème de l'application"
              subtitle="Clair, Sombre ou Système"
              type="select"
              value={themeLabel}
              onPress={handleOpenThemeSettings}
              icon="color-palette"
              showArrow={true}
            />

            <View className={`h-px ${isDark ? 'bg-dark-border' : 'bg-light-border'} my-2 mx-[-16px]`} />

            <SettingsItem
              title="Langue"
              type="select"
              value={settings.language}
              onPress={handleLanguageSelect}
              icon="language"
              showArrow={true}
            />
          </SettingsSection>

          {/* Section Notifications */}
          <SettingsSection title="Notifications">
            <SettingsItem
              title="Notifications push"
              type="toggle"
              value={settings.pushNotifications}
              onToggle={handlePushNotificationsToggle}
              icon="notifications"
              showArrow={false}
            />
          </SettingsSection>
        </ScrollView>
      </View>
    </>
  );
}
