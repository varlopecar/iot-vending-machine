import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { Stack } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useTailwindTheme } from '../hooks/useTailwindTheme';
import {
  SettingsSection,
  SettingsItem,
  TabBarSpacer
} from '../components/ui';

export default function ParametresScreen() {
  const { isDark, currentTheme, setTheme } = useTailwindTheme();
  
  const [settings, setSettings] = useState({
    theme: currentTheme === 'dark', // true = dark mode forcé
    language: 'Français',
    pushNotifications: true,
    news: true,
    events: true
  });

  // Synchroniser l'état local avec le thème global
  useEffect(() => {
    // Si le thème est 'system', on suit le thème du téléphone
    // Si c'est 'dark', on force le mode sombre
    // Si c'est 'light', on force le mode clair
    setSettings(prev => ({ 
      ...prev, 
      theme: currentTheme === 'dark' // Le toggle est true seulement si on force le dark mode
    }));
  }, [currentTheme]);

  const handleThemeToggle = async (value: boolean) => {
    // Si on active le toggle (value = true), on force le dark mode
    // Si on désactive le toggle (value = false), on revient au thème système
    const newTheme = value ? 'dark' : 'system';
    await setTheme(newTheme);
    setSettings(prev => ({ ...prev, theme: value }));
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
      } catch (error) {
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

  const handleNewsToggle = (value: boolean) => {
    setSettings(prev => ({ ...prev, news: value }));
  };

  const handleEventsToggle = (value: boolean) => {
    setSettings(prev => ({ ...prev, events: value }));
  };

  const handleResetTheme = async () => {
    Alert.alert(
      'Réinitialiser le thème',
      'Voulez-vous réinitialiser le thème aux paramètres système ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Réinitialiser', 
          style: 'destructive',
          onPress: async () => {
            await setTheme('system');
            setSettings(prev => ({ ...prev, theme: false }));
            console.log('Theme reset to system');
          }
        }
      ]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Paramètres',
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
            title="Forcer le mode sombre"
            subtitle={currentTheme === 'system' ? 'Suit le thème de votre téléphone' : currentTheme === 'dark' ? 'Mode sombre forcé' : 'Mode clair forcé'}
            type="toggle"
            value={settings.theme}
            onToggle={handleThemeToggle}
            icon="moon"
            showArrow={false}
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

          <View className={`h-px ${isDark ? 'bg-dark-border' : 'bg-light-border'} my-2 mx-[-16px]`} />
          
          <SettingsItem
            title="Réinitialiser le thème"
            subtitle="Remettre le thème aux paramètres système"
            type="action"
            onPress={handleResetTheme}
            icon="refresh"
            showArrow={false}
          />

          <View className={`h-px ${isDark ? 'bg-dark-border' : 'bg-light-border'} my-2 mx-[-16px]`} />
          
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
          
          <View className={`h-px ${isDark ? 'bg-dark-border' : 'bg-light-border'} my-2 mx-[-16px]`} />
          
          <SettingsItem
            title="Actualités"
            subtitle="Être informé des dernières actualités"
            type="toggle"
            value={settings.news}
            onToggle={handleNewsToggle}
            icon="newspaper"
            showArrow={false}
          />
          
          <View className={`h-px ${isDark ? 'bg-dark-border' : 'bg-light-border'} my-2 mx-[-16px]`} />
          
          <SettingsItem
            title="Évènements"
            subtitle="Être informé des évènements à venir"
            type="toggle"
            value={settings.events}
            onToggle={handleEventsToggle}
            icon="calendar"
            showArrow={false}
          />
        </SettingsSection>
              </ScrollView>
      </View>
    </>
  );
}
