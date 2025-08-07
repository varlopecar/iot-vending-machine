# Tailwind CSS pour React Native

Ce projet utilise NativeWind pour intégrer Tailwind CSS dans l'application React Native.

## Installation

Les dépendances suivantes ont été installées :
- `nativewind` : Intégration Tailwind CSS pour React Native
- `tailwindcss` : Framework CSS utilitaire

## Configuration

### Fichiers de configuration

1. **`tailwind.config.js`** : Configuration Tailwind avec les thèmes personnalisés
2. **`babel.config.js`** : Configuration Babel avec le plugin NativeWind
3. **`nativewind-env.d.ts`** : Types TypeScript pour NativeWind

### Thèmes

Le projet supporte deux thèmes :
- **Light Theme** : Thème clair par défaut
- **Dark Theme** : Thème sombre (suit les préférences système)

## Utilisation

### Hook de thème

```typescript
import { useTailwindTheme, themeClasses } from '../hooks/useTailwindTheme';

function MonComposant() {
  const { theme, colors, isDark } = useTailwindTheme();
  
  return (
    <View className={themeClasses.background}>
      <Text className={themeClasses.text}>
        Thème actuel: {theme}
      </Text>
    </View>
  );
}
```

### Composants UI

```typescript
import { TailwindView, TailwindText, TailwindButton } from './components/ui';

function MonComposant() {
  return (
    <TailwindView className="bg-light-background dark:bg-dark-background p-4">
      <TailwindText className="text-light-text dark:text-dark-text text-lg">
        Mon texte
      </TailwindText>
      <TailwindButton title="Mon bouton" />
    </TailwindView>
  );
}
```

### Classes prédéfinies

Utilisez les classes prédéfinies pour une cohérence visuelle :

```typescript
import { themeClasses } from '../hooks/useTailwindTheme';

// Arrière-plans
themeClasses.background  // bg-light-background dark:bg-dark-background
themeClasses.surface     // bg-light-surface dark:bg-dark-surface

// Texte
themeClasses.text        // text-light-text dark:text-dark-text
themeClasses.textSecondary // text-light-textSecondary dark:text-dark-textSecondary
themeClasses.textPrimary // text-light-primary dark:text-dark-primary

// Bordures
themeClasses.border      // border-light-border dark:border-dark-border

// Boutons
themeClasses.button      // bg-light-primary dark:bg-dark-primary
themeClasses.buttonText  // text-white dark:text-black

// Couleurs de statut
themeClasses.success     // text-light-success dark:text-dark-success
themeClasses.warning     // text-light-warning dark:text-dark-warning
themeClasses.error       // text-light-error dark:text-dark-error
themeClasses.info        // text-light-info dark:text-dark-info
```

### Classes personnalisées

Vous pouvez utiliser toutes les classes Tailwind CSS avec les préfixes `light:` et `dark:` :

```typescript
<View className="bg-white dark:bg-gray-900 p-4 rounded-lg">
  <Text className="text-black dark:text-white text-lg font-semibold">
    Mon contenu
  </Text>
</View>
```

## Palette de couleurs

### Light Theme
- `primary`: #0a7ea4
- `secondary`: #687076
- `background`: #ffffff
- `surface`: #f8f9fa
- `text`: #11181C
- `textSecondary`: #687076
- `border`: #e1e5e9
- `success`: #10b981
- `warning`: #f59e0b
- `error`: #ef4444
- `info`: #3b82f6

### Dark Theme
- `primary`: #ffffff
- `secondary`: #9BA1A6
- `background`: #151718
- `surface`: #1a1b1e
- `text`: #ECEDEE
- `textSecondary`: #9BA1A6
- `border`: #2a2b2e
- `success`: #10b981
- `warning`: #f59e0b
- `error`: #ef4444
- `info`: #3b82f6

## Exemple d'utilisation

Consultez le fichier `components/ThemeExample.tsx` pour voir un exemple complet d'utilisation des thèmes et des composants.

## Bonnes pratiques

1. **Utilisez les classes prédéfinies** pour maintenir la cohérence
2. **Testez toujours les deux thèmes** lors du développement
3. **Utilisez les préfixes `light:` et `dark:`** pour les styles spécifiques au thème
4. **Privilégiez les composants UI** pour les éléments réutilisables
5. **Documentez les nouvelles couleurs** ajoutées à la palette

## Ajout de nouvelles couleurs

Pour ajouter de nouvelles couleurs à la palette :

1. Ajoutez la couleur dans `tailwind.config.js`
2. Mettez à jour les interfaces dans `hooks/useTailwindTheme.ts`
3. Ajoutez les classes correspondantes dans `themeClasses`
4. Documentez la nouvelle couleur dans ce README 