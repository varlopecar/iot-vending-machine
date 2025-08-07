import { Platform } from 'react-native';
import { TailwindView, TailwindText } from '../../components/ui';
import { themeClasses } from '../../hooks/useTailwindTheme';

export default function HomeScreen() {
  return (
    <TailwindView className={`${themeClasses.background} flex-1 p-4`}>
      <TailwindView className="mb-6">
        <TailwindText className={`${themeClasses.text} text-2xl font-bold`}>
          Bienvenue !
        </TailwindText>
      </TailwindView>
      
      <TailwindView className="mb-6">
        <TailwindText className={`${themeClasses.text} text-lg font-semibold mb-2`}>
          Étape 1 : Testez
        </TailwindText>
        <TailwindText className={`${themeClasses.textSecondary} text-base`}>
          Modifiez <TailwindText className="font-mono">app/(tabs)/index.tsx</TailwindText> pour voir les changements.
        </TailwindText>
        <TailwindText className={`${themeClasses.textSecondary} text-base mt-2`}>
          Appuyez sur{' '}
          <TailwindText className="font-mono">
            {Platform.select({
              ios: 'cmd + d',
              android: 'cmd + m',
              web: 'F12',
            })}
          </TailwindText>{' '}
          pour ouvrir les outils de développement.
        </TailwindText>
      </TailwindView>
      
      <TailwindView className="mb-6">
        <TailwindText className={`${themeClasses.text} text-lg font-semibold mb-2`}>
          Étape 2 : Explorez
        </TailwindText>
        <TailwindText className={`${themeClasses.textSecondary} text-base`}>
          Utilisez les composants Tailwind pour créer une interface moderne et accessible.
        </TailwindText>
      </TailwindView>
      
      <TailwindView className="mb-6">
        <TailwindText className={`${themeClasses.text} text-lg font-semibold mb-2`}>
          Étape 3 : Développez
        </TailwindText>
        <TailwindText className={`${themeClasses.textSecondary} text-base`}>
          Commencez à développer votre application de distributeur automatique connecté !
        </TailwindText>
      </TailwindView>
    </TailwindView>
  );
}
