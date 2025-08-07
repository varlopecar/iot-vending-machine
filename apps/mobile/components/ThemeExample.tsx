import React from 'react';
import { ScrollView } from 'react-native';
import { TailwindView, TailwindText, TailwindButton } from './ui';
import { useTailwindTheme, themeClasses } from '../hooks/useTailwindTheme';

export function ThemeExample() {
  const { theme, colors, isDark } = useTailwindTheme();

  return (
    <ScrollView className="flex-1">
      <TailwindView className={`${themeClasses.background} flex-1 p-4`}>
        {/* Header */}
        <TailwindView className="mb-6">
          <TailwindText className={`${themeClasses.text} text-2xl font-bold mb-2`}>
            Exemple de Thème
          </TailwindText>
          <TailwindText className={`${themeClasses.textSecondary} text-base`}>
            Thème actuel: {theme} ({isDark ? 'Sombre' : 'Clair'})
          </TailwindText>
        </TailwindView>

        {/* Color Palette */}
        <TailwindView className="mb-6">
          <TailwindText className={`${themeClasses.text} text-lg font-semibold mb-3`}>
            Palette de Couleurs
          </TailwindText>
          
          <TailwindView className="space-y-2">
            <TailwindView className={`${themeClasses.surface} p-3 rounded-lg border ${themeClasses.border}`}>
              <TailwindText className={`${themeClasses.textPrimary} font-medium`}>
                Couleur Primaire
              </TailwindText>
              <TailwindText className={`${themeClasses.textSecondary} text-sm`}>
                {colors.primary}
              </TailwindText>
            </TailwindView>

            <TailwindView className={`${themeClasses.surface} p-3 rounded-lg border ${themeClasses.border}`}>
              <TailwindText className={`${themeClasses.text} font-medium`}>
                Texte Principal
              </TailwindText>
              <TailwindText className={`${themeClasses.textSecondary} text-sm`}>
                {colors.text}
              </TailwindText>
            </TailwindView>

            <TailwindView className={`${themeClasses.surface} p-3 rounded-lg border ${themeClasses.border}`}>
              <TailwindText className={`${themeClasses.textSecondary} font-medium`}>
                Texte Secondaire
              </TailwindText>
              <TailwindText className={`${themeClasses.textSecondary} text-sm`}>
                {colors.textSecondary}
              </TailwindText>
            </TailwindView>
          </TailwindView>
        </TailwindView>

        {/* Status Colors */}
        <TailwindView className="mb-6">
          <TailwindText className={`${themeClasses.text} text-lg font-semibold mb-3`}>
            Couleurs de Statut
          </TailwindText>
          
          <TailwindView className="space-y-2">
            <TailwindView className={`${themeClasses.surface} p-3 rounded-lg border ${themeClasses.border}`}>
              <TailwindText className={`${themeClasses.success} font-medium`}>
                Succès
              </TailwindText>
            </TailwindView>

            <TailwindView className={`${themeClasses.surface} p-3 rounded-lg border ${themeClasses.border}`}>
              <TailwindText className={`${themeClasses.warning} font-medium`}>
                Avertissement
              </TailwindText>
            </TailwindView>

            <TailwindView className={`${themeClasses.surface} p-3 rounded-lg border ${themeClasses.border}`}>
              <TailwindText className={`${themeClasses.error} font-medium`}>
                Erreur
              </TailwindText>
            </TailwindView>

            <TailwindView className={`${themeClasses.surface} p-3 rounded-lg border ${themeClasses.border}`}>
              <TailwindText className={`${themeClasses.info} font-medium`}>
                Information
              </TailwindText>
            </TailwindView>
          </TailwindView>
        </TailwindView>

        {/* Buttons */}
        <TailwindView className="mb-6">
          <TailwindText className={`${themeClasses.text} text-lg font-semibold mb-3`}>
            Boutons
          </TailwindText>
          
          <TailwindView className="space-y-3">
            <TailwindButton title="Bouton Primaire" />
            
            <TailwindButton 
              title="Bouton Secondaire" 
              className="bg-light-secondary dark:bg-dark-secondary"
              textClassName="text-light-background dark:text-dark-background"
            />
            
            <TailwindButton 
              title="Bouton de Succès" 
              className="bg-light-success dark:bg-dark-success"
            />
          </TailwindView>
        </TailwindView>

        {/* Custom Classes Example */}
        <TailwindView className="mb-6">
          <TailwindText className={`${themeClasses.text} text-lg font-semibold mb-3`}>
            Classes Personnalisées
          </TailwindText>
          
          <TailwindView className={`${themeClasses.surface} p-4 rounded-xl border-2 ${themeClasses.border}`}>
            <TailwindText className={`${themeClasses.text} text-base mb-2`}>
              Ceci est un exemple de conteneur avec des classes personnalisées
            </TailwindText>
            <TailwindText className={`${themeClasses.textSecondary} text-sm`}>
              Utilisez les classes Tailwind avec les préfixes light: et dark: pour des thèmes adaptatifs
            </TailwindText>
          </TailwindView>
        </TailwindView>
      </TailwindView>
    </ScrollView>
  );
} 