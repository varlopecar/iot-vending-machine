import { Link, Stack } from 'expo-router';
import { TailwindView, TailwindText } from '../components/ui';
import { themeClasses } from '../hooks/useTailwindTheme';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <TailwindView className={`${themeClasses.background} flex-1 items-center justify-center p-5`}>
        <TailwindText className={`${themeClasses.text} text-lg mb-4`}>
          Cette page n&apos;existe pas.
        </TailwindText>
        <Link href="/" asChild>
          <TailwindView className={`${themeClasses.surface} px-4 py-3 rounded-lg border ${themeClasses.border}`}>
            <TailwindText className={`${themeClasses.textPrimary} font-semibold`}>
              Retour à l&apos;accueil
            </TailwindText>
          </TailwindView>
        </Link>
      </TailwindView>
    </>
  );
}
